import Entity from './entity.js';
import ItemRegistry from '../registries/itemRegistry.js';
import ItemStack from '../items/itemStack.js';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

import SharedConfig from '../../configs/shared';
const { PLAYER_SCALE } = SharedConfig.PLAYER;
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

import ServerConfig from '../../configs/server';
const { RACISM, RACISM_PERM } = ServerConfig.PLAYER;

class Player extends Entity {
    constructor(id, socket, username, x, y, dir, data){
        super(x, y, dir);
        this.id = id;

        this.chunk = { x: this.chunk.x + 10, y: this.chunk.y + 10}; // purposefully make chunk off so that first update has load data

        this.asset = ASSETS.PLAYER;
        this.socket = socket;
        this.username = username;
        this.kills = 0;
        this.playerdelay = 0;
        this.scale = PLAYER_SCALE;
        this.health = 10;

        // racism
        const antiracism = 1 - RACISM;
        this.color = {
            r: antiracism + Math.random() * RACISM,
            g: antiracism + Math.random() * RACISM,
            b: antiracism + Math.random() * RACISM,
        };

        // inventory
        this.inventory = Array(INVENTORY_SIZE).fill(null);
        this.inventory[1] = new ItemStack(ItemRegistry.Get("stone_block"));
        this.inventory[2] = new ItemStack(ItemRegistry.Get("pickaxe"));
        this.inventory[3] = new ItemStack(ItemRegistry.Get("sword"));
        this.hotbarslot = 0;

        // reading data
        if(data !== undefined){
            const playerdata = JSON.parse(data);
            
            this.username = playerdata.username;
            this.kills = playerdata.kills;

            if(playerdata.dead){
                if(RACISM_PERM){
                    this.color = playerdata.color;
                }
            }else{
                this.x = playerdata.x;
                this.y = playerdata.y;
                this.health = playerdata.health;
                this.color = playerdata.color;
    
                console.log(playerdata.inventory);
                this.inventory = playerdata.inventory.map(stack => stack ? new ItemStack(ItemRegistry.Get(stack.name), stack.amount) : null);
            }
        }

        this.resetFixes();
    }

    // #region setters

    update(data){
        if(this.playerdelay == 0){
            this.playerdelay = Date.now() - data.t;
        }
        super.update(data);
    }

    // #endregion

    // #region fixes

    resetFixes(){
        this.fixes = {
            pushx: null,
            pushy: null,
            setpos: null,
        }
    }

    getFixes(){
        const fixescopy = {
            pushx: this.fixes.pushx,
            pushy: this.fixes.pushy,
            setpos: this.fixes.setpos,
        }
        return fixescopy;
    }

    push(x, y){
        this.fixes.pushx += x;
        this.fixes.pushy += y;
    }

    setPos(x, y){
        this.fixes.setpos = {
            x: x,
            y: y
        }
    }

    // #endregion

    // #region attacks

    attack(dir){
        this.lastattack = Date.now();
        this.lastattackdir = dir;
        this.startSwing();
    }

    // #endregion

    // #region serialization

    serializeForUpdate(){
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                username: this.username,
                playerdelay: this.playerdelay,
                color: this.color,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    serializeForWrite(){
        return JSON.stringify({
            dead: false,
            username: this.username,
            x: this.x,
            y: this.y,
            health: this.health,
            kills: this.kills,
            color: this.color,
            inventory: this.inventory.map(stack => stack ? stack.serializeForWrite() : null),
        });
    }

    serializeAfterKilled(){
        return JSON.stringify({
            dead: true,
            username: this.username,
            kills: this.kills,
            color: this.color,
        });
    }

    // #endregion
}

export default Player;