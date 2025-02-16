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
import GameObject from "./objects/object.js";
import DroppedStack from "./objects/droppedStack.js";
import World from "./world/world.js";
import { collectCheck, itemMergeCheck, attackHitCheck } from "./collisions.js";

import AttackComponent from "./components/itemcomponents/attackComponent.js";
import BuildComponent from "./components/itemcomponents/buildComponent.js";
import MineComponent from "./components/itemcomponents/mineComponent.js";

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

    getAllObjects(){
        return [...Object.values(this.players), ...Object.values(this.entities), ...Object.values(this.objects)];
    }

    getEntities(){
        return [...Object.values(this.players), ...Object.values(this.entities)];
    }

    getNonplayers(){
        return [...Object.values(this.entities), ...Object.values(this.objects)];
    }

    getObjects(){
        return Object.values(this.objects);
    }

    getPlayerEntities(){
        return Object.values(this.players);
    }

    getNonplayerEntities(){
        return Object.values(this.entities);
    }

    getDroppedStacks(){
        return this.getObjects().filter(o => o instanceof DroppedStack);
    }

    removeObject(id: string){
        delete this.objects[id];
    }

    removeEntity(id: string){
        delete this.entities[id];
    }

    // #endregion

    // #region inputs

    click(socket: Socket, info: any){
        if(socket.id === undefined) return;
        
        if(this.players[socket.id] !== undefined){
            if(Date.now() - this.players[socket.id].lastattack > ATTACK_DELAY * 1000){
                const dir = Math.atan2(info.xoffset, info.yoffset);
                const cellpos = { x: Math.floor(info.mex + info.xoffset), y: Math.floor(info.mey + info.yoffset) };

                const hotbarItem = this.players[socket.id].inventory[this.players[socket.id].hotbarslot];

                if(!hotbarItem){
                    // fist attack
                    this.players[socket.id].attack(dir);
                    attackHitCheck(this.players[socket.id], this.getEntities(), dir, 1);
                }else if(hotbarItem.item.componentHandler.hasComponent(AttackComponent.cid)){
                    this.players[socket.id].attack(dir);
                    const component = hotbarItem.item.componentHandler.getComponent(AttackComponent.cid);
                    if(!(component instanceof AttackComponent)) return;
                    attackHitCheck(this.players[socket.id], this.getEntities(), dir, component.damage);
                }else if(hotbarItem.item.componentHandler.hasComponent(MineComponent.cid)){
                    this.world.breakcell(cellpos.x, cellpos.y, true);
                }else if(hotbarItem.item.componentHandler.hasComponent(BuildComponent.cid)){
                    if(this.world.cellEmpty(cellpos.x, cellpos.y)){
                        const component = hotbarItem.item.componentHandler.getComponent(BuildComponent.cid);
                        if(!(component instanceof BuildComponent)) return;
                        if(this.world.placecell(cellpos.x, cellpos.y, component.block)){
                            this.players[socket.id].removeFromSlot(this.players[socket.id].hotbarslot, 1);
                        }
                    }
                }else{
                    // not usable i guess idk
                }
            }
        }
    }

    interact(socket: Socket, info: any){
        if(socket.id === undefined) return;
        
        if(this.players[socket.id] !== undefined){
            
        }
    }

    handleInput(socket: Socket, inputs: any){
        if(socket.id === undefined) return;
        
        if(this.players[socket.id] !== undefined){
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
    }

    // #endregion

    // #region updates

    update(){
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

        // tick entities
        this.getNonplayerEntities().forEach(e => {
            e.ontick.emit("tick", dt);
        });

        // proccess collisions
        this.getPlayerEntities().forEach(p => {
            collectCheck(p, this.getDroppedStacks(), this);
        });

        this.getDroppedStacks().forEach(o => {
            itemMergeCheck(o, this.getDroppedStacks(), this);
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

    tickChunkUnloader(){
        this.world.tickChunkUnloader();
    }

    createUpdate(player: Player){
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