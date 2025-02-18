import crypto from "crypto";
import { Socket } from "socket.io-client";

import FileManager from "../server/fileManager.js";
import AccountManager from "../server/accountManager.js";
import PlayerManager from "./managers/playerManager.js";
import OpManager from "./managers/opManager.js";
import BanManager from "./managers/banManager.js";
import ChatManager from "./managers/chatManager.js";
import Player from "./objects/player.js";
import NonplayerEntity from "./objects/nonplayerEntity.js";
import GameObject from "./objects/gameObject.js";
import DroppedStack from "./objects/droppedStack.js";
import World from "./world/world.js";
import { attackHitCheck } from "./collisions.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES } = Constants;

import SharedConfig from "../configs/shared.js";
const { ATTACK_DELAY } = SharedConfig.ATTACK;
const { CELLS_HORIZONTAL, CELLS_VERTICAL } = SharedConfig.WORLD;

import ServerConfig from "../configs/server.js";
const { CHUNK_UNLOAD_RATE } = ServerConfig.WORLD;
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { OP_PASSCODE, OP_PASSCODE_WHEN_OPS } = ServerConfig.OP_PASSCODE;

// initialize registries
import "./registries/itemRegistry.js";
import Entity from "./objects/entity.js";

/** The main class that manages the game world and the entities in it */
class Game {
    fileManager: FileManager;
    accountManager: AccountManager;
    playerManager: PlayerManager;
    opManager: OpManager;
    banManager: BanManager;
    chatManager: ChatManager;

    players: {[key: string]: Player} = {};
    objects: {[key: string]: GameObject} = {};
    entities: {[key: string]: NonplayerEntity} = {};

    world: World;

    lastUpdateTime: number;
    shouldSendUpdate: boolean;

    oppasscode: string;
    oppasscodeused: boolean;

    constructor(fileManager: FileManager, accountManager: AccountManager){
        // managers
        this.fileManager = fileManager;
        this.accountManager = accountManager;
        this.playerManager = new PlayerManager(this);
        this.opManager = new OpManager(this);
        this.banManager = new BanManager(this);
        this.chatManager = new ChatManager(this);
        
        // world
        this.world = new World(this);

        // updates
        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;

        // intervals
        setInterval(this.tickChunkUnloader.bind(this), 1000 / CHUNK_UNLOAD_RATE);
        setInterval(this.update.bind(this), 1000 / SERVER_UPDATE_RATE);

        // op passcode (one time use to give owner op)
        this.oppasscode = crypto.randomUUID();
        if(OP_PASSCODE && (this.opManager.opCount() == 0 || OP_PASSCODE_WHEN_OPS)){
            this.oppasscodeused = false;
            console.log(`oppasscode: ${this.oppasscode}`);
        }else{
            this.oppasscodeused = true;
        }
    }

    // #region entities

    /** Returns all ticking objects loaded in the game world */
    getAllObjects(): GameObject[] {
        return [...Object.values(this.players), ...Object.values(this.entities), ...Object.values(this.objects)];
    }

    /** Returns all ticking entities loaded in the game world */
    getEntities(): Entity[] {
        return [...Object.values(this.players), ...Object.values(this.entities)];
    }

    /** Returns all ticking non-player objects loaded in the game world */
    getNonplayers(): GameObject[] {
        return [...Object.values(this.entities), ...Object.values(this.objects)];
    }

    /** Returns all ticking non-entity objects loaded in the game world */
    getObjects(): GameObject[] {
        return Object.values(this.objects);
    }

    /** Returns all ticking players loaded in the game world */
    getPlayerEntities(): Player[] {
        return Object.values(this.players);
    }

    /** Returns all ticking non-player entities loaded in the game world */
    getNonplayerEntities(): NonplayerEntity[] {
        return Object.values(this.entities);
    }

    /** Returns all ticking dropped stacks loaded in the game world */
    getDroppedStacks(): DroppedStack[] {
        return this.getObjects().filter(o => o instanceof DroppedStack);
    }

    /** Removes and unloads the non-entity object with the given id from the game world */
    removeObject(id: string): void {
        delete this.objects[id];
    }

    /** Removes and unloads the non-player entity with the given id from the game world */
    removeEntity(id: string): void {
        delete this.entities[id];
    }

    // #endregion

    // #region inputs

    /** Response to a click (left click) message from a client */
    click(socket: Socket, info: any): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(info);
        
        if(Date.now() - this.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.players[socket.id].inventory[this.players[socket.id].hotbarslot];

            // use the item or run default use case
            if(hotbarItem == null){
                this.players[socket.id].attack(newinfo.dir);
                attackHitCheck(this.players[socket.id], this.getEntities(), newinfo.dir, 1);
            }else hotbarItem.use(this, this.players[socket.id], newinfo);
        }
    }

    /** Response to a interaction (right click) message from a client */
    interact(socket: Socket, info: any): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(info);
        

    }

    /** Gets formatted click info from the raw click info in a client click message */
    getClickInfo(info: any): any{
        return {
            dir: Math.atan2(info.xoffset, info.yoffset),
            cellpos: { x: Math.floor(info.mex + info.xoffset), y: Math.floor(info.mey + info.yoffset) },
        }
    }

    /** Response to the general input message from a client */
    handleInput(socket: Socket, inputs: any): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        const { t, dir, x, y, hotbarslot } = inputs;
        if(this.players[socket.id]){
            this.players[socket.id].update({
                dir: dir,
                x: x,
                y: y,
                t: t,
            });
            this.players[socket.id].hotbarslot = hotbarslot;
        }
    }

    // #endregion

    // #region updates

    /** Tick the game world and all currently loaded objects */
    update(): void {
        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // check deaths
        this.getPlayerEntities().forEach(p => {
            if(p.dead){
                this.playerManager.killPlayer(p.socket, p.killedby);
            }
        });

        this.getNonplayerEntities().forEach(e => {
            if(e.dead){
                delete this.entities[e.id];
            }
        });

        // tick objects
        this.getAllObjects().forEach(o => {
            o.eventEmitter.emit("tick", this, dt);
        });

        // check to send update
        if(this.shouldSendUpdate){
            // send fat update packets
            this.getPlayerEntities().forEach(player => {
                player.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(player));
            });
            this.shouldSendUpdate = false;

            // reset cell updates in loaded chunks
            this.world.resetCellUpdates();
        }else{
            this.shouldSendUpdate = true;
        }
    }

    /** Tick the worlds chunk unloader */
    tickChunkUnloader(): void {
        this.world.tickChunkUnloader();
    }

    /** Create an update object to be sent to the specified players client */
    createUpdate(player: Player): any {
        // get players
        const nearbyPlayers = this.getPlayerEntities().filter(p => p.id != player.id
            && Math.abs(p.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(p.y - player.y) < CELLS_VERTICAL / 2
        );

        // get fixes
        const fixescopy = player.getFixes();
        player.resetFixes();

        // get world updates
        const worldLoad = this.world.loadPlayerChunks(player);
        player.chunk = worldLoad.chunk;
        
        // check for falling
        const tilesOn = player.tilesOn();
        let notair = 0;
        tilesOn.forEach(tile => {
            const cell = this.world.getCell(tile.x, tile.y, false);
            if(cell){
                if(cell.floor){
                    notair++;
                }
            }
        });
        if(notair == 0){
            player.falling = true;
        }

        // get entities
        const nearbyEntities = this.getNonplayers().filter(e =>
            Math.abs(e.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < CELLS_VERTICAL / 2
        );

        // return full update object
        return {
            t: Date.now(),
            me: player.serializeForUpdate(),
            fixes: fixescopy,
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            entities: nearbyEntities.map(e => e.serializeForUpdate()),
            worldLoad: worldLoad,
        };
    }

    // #endregion
}

export default Game;