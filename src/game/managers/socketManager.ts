import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import Game from "../game.js";
import Logger from "../../server/logging/logger.js";
import Player from "../objects/player.js";
import Cell from "../world/cell.js";
import Entity from "../objects/entity.js";
import { ClickContent, CraftContent, DropContent, InputContent, SwapContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES, MINE_TYPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { BASE_REACH, BASE_ACTION_DELAY } = SharedConfig.PLAYER;
const { BASE_DAMAGE, BASE_KNOCKBACK, BASE_SWING_DELAY } = SharedConfig.ATTACK;

/** Manages socket connections and inputs on the server */
class SocketManager {
    private readonly logger: Logger;
    private readonly game: Game;

    constructor(io: SocketIo, game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.SOCKET_MANAGER);
        this.game = game;

        // prepare socket connections
        io.on("connection", socket => {
            socket.on(MSG_TYPES.INPUT, (content) => { this.handlePlayerInput(socket as any, content); });
            socket.on(MSG_TYPES.CLICK, (content) => { this.handlePlayerClick(socket as any, content); });
            socket.on(MSG_TYPES.INTERACT, (content) => { this.handlePlayerInteract(socket as any, content); });
            socket.on(MSG_TYPES.DROP, (content) => { this.handlePlayerDrop(socket as any, content); });
            socket.on(MSG_TYPES.SWAP, (content) => { this.handlePlayerSwap(socket as any, content); });
            socket.on(MSG_TYPES.CRAFT, (content) => { this.handlePlayerCraft(socket as any, content); });
            socket.on(MSG_TYPES.DISCONNECT, () => { this.game.playerManager.removePlayer(socket as any); });
            socket.on(MSG_TYPES.SEND_MESSAGE, (content) => { this.game.chatManager.chat(socket as any, content); });
        });
    }

    // #region inputs

    /** Response to the general input message from a client */
    handlePlayerInput(socket: Socket, content: InputContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        player.update(content);
    }

    /** Response to a click (left click) message from a client */
    handlePlayerClick(socket: Socket, content: ClickContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        if(!player.canAction()) return;

        const newinfo = this.getClickInfo(player, content);

        const hotbarItem = player.getCurrentItem();

        // try to use item
        if(hotbarItem !== null){
            if(!hotbarItem.use(this.game, player, newinfo)){
                if(!player.canAction()){
                    player.setImmediateAction(false);
                    return;
                }
            }
        }

        // default break action
        if(newinfo.cell !== null){
            if(newinfo.cell.block !== null){
                if(newinfo.cell.block.definition.minetype == MINE_TYPES.ANY && newinfo.cell.block.definition.hardness <= 0){
                    newinfo.cell.breakBlock(true, this.game);
                    return;
                }
            }
        }

        // default swing action
        player.startSwing({
            dir: newinfo.dir,
            swingduration: BASE_SWING_DELAY * 1000,
            actionduration: BASE_ACTION_DELAY * 1000,
            damage: BASE_DAMAGE,
            knockback: BASE_KNOCKBACK,
        });
    }

    /** Response to a interaction (right click) message from a client */
    handlePlayerInteract(socket: Socket, content: ClickContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        if(!player.canAction()) return;

        const newinfo = this.getClickInfo(player, content);

        const hotbarItem = player.getCurrentItem();

        // try to interact with entity
        if(newinfo.entity !== null){
            newinfo.entity.emitInteractEvent(this.game, player);
            if(!player.canAction()){
                    player.setImmediateAction(false);
                    return;
                }
        }

        // try to use item
        if(hotbarItem !== null){
            if(!hotbarItem.interact(this.game, player, newinfo)){
                if(!player.canAction()){
                    player.setImmediateAction(false);
                    return;
                }
            }
        }

        // default action
        if(newinfo.dist > BASE_REACH) return;
        if(newinfo.cell === null) return;

        if(newinfo.cell.block !== null){
            newinfo.cell.block.emitInteractEvent(this.game, player, newinfo);
        }else if(newinfo.cell.floor !== null){
            newinfo.cell.floor.emitInteractEvent(this.game, player, newinfo);
        }else if(newinfo.cell.ceiling !== null){
            newinfo.cell.ceiling.emitInteractEvent(this.game, player, newinfo);
        }

        player.setImmediateAction(false);
    }

    /** Gets formatted click info from the raw click info in a client click message */
    getClickInfo(player: Player, content: ClickContent): ClickContentExpanded {
        const cellx = Math.floor(content.mex + content.xoffset);
        const celly = Math.floor(content.mey + content.yoffset);

        return {
            dir: Math.atan2(content.xoffset, content.yoffset),
            cell: player.layer.getCell(cellx, celly, false),
            dist: Math.sqrt(content.xoffset * content.xoffset + content.yoffset * content.yoffset),
            entity: this.game.collisionManager.clickEntity(player.layer, content.mex + content.xoffset, content.mey + content.yoffset),
        };
    }

    /** Response to a drop message from a client */
    handlePlayerDrop(socket: Socket, content: DropContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        player.dropFromSlot(content.slot, this.game, content.all ? undefined : 1);
    }

    /** Response to a swap message from a client */
    handlePlayerSwap(socket: Socket, content: SwapContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        const inventory = player.getCombinedInventory();

        inventory.swapSlots(content.slot1, content.slot2);
    }

    /** Response to a craft message from a client */
    handlePlayerCraft(socket: Socket, content: CraftContent): void {
        const player = this.game.entityManager.getPlayer(socket.id as string);
        if(player === undefined) return;

        const stationname = player.getStation() !== null ? player.getStation()!.name : null;
        const inventory = player.getCombinedInventory();

        this.game.craftManager.craftRecipe(inventory, stationname, player.layer, player.x, player.y, content);
    }

    // #endregion
}

/** Defines the format of the click and interact message after being parsed */
export type ClickContentExpanded = {
    dir: number;
    cell: Cell | null;
    dist: number;
    entity: Entity | null;
};

export default SocketManager;
