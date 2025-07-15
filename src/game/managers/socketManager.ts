import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import Game from "../game.js";
import Logger from "../../server/logging/logger.js";
import { Pos } from "../../shared/types.js";
import Entity from "../objects/entity.js";
import { ClickContent, CraftContent, DropContent, InputContent, SwapContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES, MINE_TYPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;
const { ATTACK_DELAY } = SharedConfig.ATTACK;

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
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;
        
        player.update(content);
    }

    /** Response to a click (left click) message from a client */
    handlePlayerClick(socket: Socket, content: ClickContent): void {
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;

        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - player.lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = player.getInventory().getSlot(player.hotbarslot);

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.use(this.game, player, newinfo)) return;
            }

            // default break action
            const cell = this.game.world.getCell(newinfo.cellpos.x, newinfo.cellpos.y, false);
            if(cell !== null){
                if(cell.block !== null){
                    if(cell.block.definition.minetype == MINE_TYPES.ANY && cell.block.definition.hardness <= 0){
                        this.game.world.breakBlock(newinfo.cellpos.x, newinfo.cellpos.y, true);
                        return;
                    }
                }
            }
            
            // default swing action
            player.startSwing(newinfo.dir, 1);
        }
    }

    /** Response to a interaction (right click) message from a client */
    handlePlayerInteract(socket: Socket, content: ClickContent): void {
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;

        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - player.lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = player.getInventory().getSlot(player.hotbarslot);

            // try to interact with entity
            if(newinfo.entity !== null){
                newinfo.entity.emitInteractEvent(this.game, player);
                return;
            }

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.interact(this.game, player, newinfo)) return;
            }

            // default action
            const cell = this.game.world.getCell(newinfo.cellpos.x, newinfo.cellpos.y, false);
            if(newinfo.dist > BASE_REACH) return;
            if(cell === null) return;
            
            if(cell.block !== null){
                cell.block.emitInteractEvent(this.game, player, newinfo);
            }else if(cell.floor !== null){
                cell.floor.emitInteractEvent(this.game, player, newinfo);
            }else if(cell.ceiling !== null){
                cell.ceiling.emitInteractEvent(this.game, player, newinfo);
            }
        }
    }

    /** Gets formatted click info from the raw click info in a client click message */
    getClickInfo(content: ClickContent): ClickContentExpanded {
        return {
            dir: Math.atan2(content.xoffset, content.yoffset),
            cellpos: { x: Math.floor(content.mex + content.xoffset), y: Math.floor(content.mey + content.yoffset) },
            dist: Math.sqrt(content.xoffset * content.xoffset + content.yoffset * content.yoffset),
            entity: this.game.collisionManager.clickEntity(content.mex + content.xoffset, content.mey + content.yoffset),
        };
    }

    /** Response to a drop message from a client */
    handlePlayerDrop(socket: Socket, content: DropContent): void {
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;
        
        player.dropFromSlot(content.slot, this.game, content.all ? undefined : 1);
    }

    /** Response to a swap message from a client */
    handlePlayerSwap(socket: Socket, content: SwapContent): void {
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;

        const inventory = player.getCombinedInventory();
        
        inventory.swapSlots(content.slot1, content.slot2);
    }

    /** Response to a craft message from a client */
    handlePlayerCraft(socket: Socket, content: CraftContent): void {
        const player = this.game.entityManager.players.get(socket.id as string);
        if(player === undefined) return;

        const stationname = player.station !== null ? player.station.name : null;
        const inventory = player.getCombinedInventory();

        this.game.craftManager.craftRecipe(inventory, stationname, player.x, player.y, content);
    }

    // #endregion
}

/** Defines the format of the click and interact message after being parsed */
export type ClickContentExpanded = {
    dir: number;
    cellpos: Pos;
    dist: number;
    entity: Entity | null;
};

export default SocketManager;