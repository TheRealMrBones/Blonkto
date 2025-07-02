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
    private game: Game;

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
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        
        if(this.game.players[socket.id]){
            this.game.players[socket.id].update(content);
        }
    }

    /** Response to a click (left click) message from a client */
    handlePlayerClick(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - this.game.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.game.players[socket.id].inventory.getSlot(this.game.players[socket.id].hotbarslot);

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.use(this.game, this.game.players[socket.id], newinfo)) return;
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
            this.game.players[socket.id].startSwing(newinfo.dir, 1);
        }
    }

    /** Response to a interaction (right click) message from a client */
    handlePlayerInteract(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - this.game.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.game.players[socket.id].inventory.getSlot(this.game.players[socket.id].hotbarslot);

            // try to interact with entity
            if(newinfo.entity !== null){
                newinfo.entity.emitInteractEvent(this.game, this.game.players[socket.id]);
                return;
            }

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.interact(this.game, this.game.players[socket.id], newinfo)) return;
            }

            // default action
            const cell = this.game.world.getCell(newinfo.cellpos.x, newinfo.cellpos.y, false);
            if(cell === null) return;
            if(cell.block === null) return;
            if(newinfo.dist > BASE_REACH) return;
            cell.block.emitInteractEvent(this.game, this.game.players[socket.id], newinfo);
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
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        
        this.game.players[socket.id].dropFromSlot(content.slot, this.game, content.all ? undefined : 1);
    }

    /** Response to a swap message from a client */
    handlePlayerSwap(socket: Socket, content: SwapContent): void {
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        
        this.game.players[socket.id].inventory.swapSlots(content.slot1, content.slot2);
    }

    /** Response to a craft message from a client */
    handlePlayerCraft(socket: Socket, content: CraftContent): void {
        if(socket.id === undefined || this.game.players[socket.id] === undefined) return;
        
        const player = this.game.players[socket.id];

        let stationname = null;
        if(player.station !== null){
            const cell = this.game.world.getCell(player.station.x, player.station.y, false);
            if(cell !== null){
                if(cell.block !== null){
                    stationname = cell.block.definition.getRegistryKey();
                }
            }
        } 

        this.game.craftManager.craftRecipe(player.inventory, stationname, player.x, player.y, content);
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