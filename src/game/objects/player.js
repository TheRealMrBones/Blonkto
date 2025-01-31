import Entity from './entity.js';
import { GetItemObject } from '../items/items.js';
import StoneBlockItem from '../items/stoneBlockItem.js';
import PickaxeItem from '../items/pickaxeItem.js';
import SwordItem from '../items/swordItem.js';

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
        this.inventory = Array(INVENTORY_SIZE).fill(false);
        this.inventory[1] = new StoneBlockItem();
        this.inventory[2] = new PickaxeItem();
        this.inventory[3] = new SwordItem();
        this.hotbarslot = 0;

        // reading data
        if(data !== undefined){
            const playerdata = data.split("|");

            if(playerdata[0] == "dead!"){
                this.username = playerdata[1];

                this.kills = parseInt(playerdata[2]);
                
                if(RACISM_PERM){
                    const colordata = playerdata[3].split(",");
                    this.color = {
                        r: parseFloat(colordata[0]),
                        g: parseFloat(colordata[1]),
                        b: parseFloat(colordata[2]),
                    }
                }
            }else{
                this.username = playerdata[0];
    
                const coordsdata = playerdata[1].split(",");
                this.x = parseFloat(coordsdata[0]);
                this.y = parseFloat(coordsdata[1]);
    
                this.health = parseInt(playerdata[2]);
                this.kills = parseInt(playerdata[3]);
    
                const colordata = playerdata[4].split(",");
                this.color = {
                    r: parseFloat(colordata[0]),
                    g: parseFloat(colordata[1]),
                    b: parseFloat(colordata[2]),
                }
    
                const inventorydata = playerdata[5].split(",");
                for(let i = 0; i < inventorydata.length; i++){
                    const itemid = parseInt(inventorydata[i]);
                    this.inventory[i] = GetItemObject(0, itemid);
                }
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
        let data = "";

        data += this.username.toString() + "|";

        data += this.x.toString() + "," + this.y.toString() + "|";

        data += this.health.toString() + "|";

        data += this.kills.toString() + "|";

        data += this.color.r.toString() + "," + this.color.g.toString() + "," + this.color.b.toString() + "|";

        for(let i = 0; i < this.inventory.length; i++){
            if(this.inventory[i]){
                data += this.inventory[i].serializeForWrite() + ",";
            }else{
                data += "0,";
            }
        }
        data += "|";

        return data;
    }

    serializeAfterKilled(){
        let data = "dead!|";

        data += this.username.toString() + "|";

        data += this.kills.toString() + "|";

        data += this.color.r.toString() + "," + this.color.g.toString() + "," + this.color.b.toString() + "|";

        return data;
    }

    // #endregion
}

export default Player;