import crypto from 'crypto';

import PlayerManager from './playerManager.js';
import OpManager from './opManager.js';
import BanManager from './banManager.js';
import ChatManager from './chatManager.js';
import World from './world/world.js';
import { attackHitCheck } from './collisions.js';
import { filterText } from './filter.js';

import AttackComponent from './components/itemcomponents/attackComponent.js';
import BuildComponent from './components/itemcomponents/buildComponent.js';
import MineComponent from './components/itemcomponents/mineComponent.js';

// initialize registries
import './registries/itemRegistry.js';

import Constants from '../shared/constants';
const { MSG_TYPES } = Constants;

import SharedConfig from '../configs/shared';
const { ATTACK_DELAY } = SharedConfig.ATTACK;
const { CELLS_HORIZONTAL, CELLS_VERTICAL } = SharedConfig.WORLD;

import ServerConfig from '../configs/server';
const { FILTER_USERNAME } = ServerConfig.PLAYER;
const { CHUNK_UNLOAD_RATE } = ServerConfig.WORLD;
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { OP_PASSCODE, OP_PASSCODE_WHEN_OPS } = ServerConfig.OP_PASSCODE;

// temp
import Pig from './objects/pig.js';

class Game {
    constructor(fm, am){
        // managers
        this.fileManager = fm;
        this.accountManager = am;
        this.playerManager = new PlayerManager(fm, this);
        this.opManager = new OpManager(fm);
        this.banManager = new BanManager(fm);
        this.chatManager = new ChatManager(this);
        
        // entities
        this.players = {};
        this.entities = {};

        //
        // TEMP CODE!
        //
        const temppig = new Pig(0, 0, 0);
        this.entities[temppig.id] = temppig;

        // world
        this.world = new World(fm);

        // updates
        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;

        // intervals
        setInterval(this.tickChunkUnloader.bind(this), 1000 / CHUNK_UNLOAD_RATE);
        setInterval(this.update.bind(this), 1000 / SERVER_UPDATE_RATE);

        // op passcode (one time use to give owner op)
        if(OP_PASSCODE && (this.opManager.opCount() == 0 || OP_PASSCODE_WHEN_OPS)){
            this.oppasscode = crypto.randomUUID();
            this.oppasscodeused = false;
            console.log(`oppasscode: ${this.oppasscode}`);
        }
    }

    // #region players

    getUsername(username){
        let newUsername = FILTER_USERNAME ? filterText(username.replace(/\s+/g, '')) : username.replace(/\s+/g, '');
        if(newUsername.trim().length === 0){
            newUsername = "Silly Goose";
        }

        if(Object.values(this.players).some(e => e.username === newUsername)){
            let done = false;
            for(let i = 2; !done; i++){
                if(!Object.values(this.players).some(e => e.username === newUsername + `${i}`)){
                    done = true;
                    newUsername += `${i}`;
                }
            }
        }
        return newUsername;
    }

    addPlayer(socket, username){
        if(this.banManager.isBanned(username)){
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, { reason: "Banned", extra: this.banManager.banReason(username) });
            return;
        }

        this.playerManager.createPlayer(socket, username);

        this.players[socket.id].socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(this.players[socket.id]));
        socket.emit(MSG_TYPES.PLAYER_INSTANTIATED, {
            x: this.players[socket.id].x,
            y: this.players[socket.id].y,
            color: this.players[socket.id].color,
            inventory: this.players[socket.id].inventory.map(itemstack => itemstack ? itemstack.serializeForUpdate() : false),
        });

        this.chatManager.sendMessage(`${username} has connected`);
    }

    removePlayer(socket){
        if(this.players[socket.id]){
            this.chatManager.sendMessage(`${this.players[socket.id].username} has disconnected`);

            this.playerManager.unloadPlayer(this.players[socket.id]);
        }
    }

    killPlayer(socket, killedby){
        this.chatManager.sendMessage(`${this.players[socket.id].username} was killed by ${killedby}`);
        
        socket.emit(MSG_TYPES.DEAD);

        this.playerManager.killPlayer(this.players[socket.id]);
    }

    // #endregion

    // #region entities

    getEntities(){
        return [...Object.values(this.players), ...Object.values(this.entities)];
    }

    getPlayerEntities(){
        return Object.values(this.players);
    }

    getNonplayerEntities(){
        return Object.values(this.entities);
    }

    // #endregion

    // #region inputs

    click(socket, info){
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
                    attackHitCheck(this.players[socket.id], this.getEntities(), dir, hotbarItem.item.componentHandler.getComponent(AttackComponent.cid).damage);
                }else if(hotbarItem.break){
                    this.world.breakcell(cellpos.x, cellpos.y);
                }else if(hotbarItem.place){
                    if(this.world.cellEmpty(cellpos.x, cellpos.y, this.getEntities()))
                        this.world.placecell(cellpos.x, cellpos.y, hotbarItem.getPlaced());
                }else{
                    // not usable i guess idk
                }
            }
        }
    }

    interact(socket, info){
        if(this.players[socket.id] !== undefined){
            
        }
    }

    handleInput(socket, inputs){
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
        Object.values(this.players).forEach(p => {
            if(p.dead){
                this.killPlayer(p.socket, p.killedby);
            }
        });

        Object.values(this.entities).forEach(e => {
            if(e.dead){
                delete this.entities[e.id];
            }
        });

        // tick entities
        Object.values(this.entities).forEach(e => {
            e.ontick.emit("tick", dt);
        });

        // check to send update
        if(this.shouldSendUpdate){
            // send fat update packets
            Object.values(this.players).forEach(player => {
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
        this.world.tickChunkUnloader(Object.values(this.players));
    }

    createUpdate(player){
        // get players
        const nearbyPlayers = Object.values(this.players).filter(p => p.id != player.id
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
        const nearbyEntities = Object.values(this.entities).filter(e =>
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