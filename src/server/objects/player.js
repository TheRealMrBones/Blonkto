const Entity = require('./entity.js');
const Constants = require('../../shared/constants.js');
const StoneBlockItem = require('../items/stoneBlockItem.js');
const PickaxeItem = require('../items/pickaxeItem.js');
const SwordItem = require('../items/swordItem.js');

class Player extends Entity {
    constructor(id, socket, username, x, y, dir, data){
        super(id, x, y, dir);
        this.op = false;
        this.asset = Constants.ASSETS.PLAYER;
        this.socket = socket;
        this.username = username;
        this.dead = false;
        this.kills = 0;
        this.lastupdated = Date.now();
        this.playerdelay = 0;
        this.scale = 1;
        this.health = 10;
        this.color = {
            r: .7 + Math.random() * .3,
            g: .7 + Math.random() * .3,
            b: .7 + Math.random() * .3,
        };

        // inventory
        this.inventory = Array(36).fill(false);
        this.inventory[1] = new StoneBlockItem();
        this.inventory[2] = new PickaxeItem();
        this.inventory[3] = new SwordItem();
        this.hotbarslot = 0;

        // reading data
        if(data !== undefined){
            const playerdata = data.split("|");
        }

        this.resetFixes();
    }

    // #region setters

    move(t, x, y){
        if(this.playerdelay == 0){
            this.playerdelay = Date.now() - t;
        }
        this.lastupdated = t;
        this.x = x;
        this.y = y;
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
                lastupdated: this.lastupdated,
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

        data += this.uesrname.toString() + "|"

        data += this.health.toString() + "|"

        data += this.color.r.toString() + "," + this.color.g.toString() + "," + this.color.b.toString() + "|"

        for(let i = 0; i < this.inventory.length; i++){
            data += this.inventory[i].itemid.toString() + ",";
        }
        data += "|";

        return data;
    }

    // #endregion
}

module.exports = Player;