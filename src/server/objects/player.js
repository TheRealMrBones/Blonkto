const Object = require('./object.js');
const Constants = require('../../shared/constants.js');

class Player extends Object {
    constructor(id, socket, username, x, y, dir){
        super(id, x, y, dir);
        this.op = false;
        this.asset = Constants.ASSETS.PLAYER;
        this.socket = socket;
        this.username = username;
        this.dead = false;
        this.kills = 0;
        this.lastclick = Date.now();
        this.lastupdated = Date.now();
        this.playerdelay = 0;
        this.color = {
            r: .7 + Math.random() * .3,
            g: .7 + Math.random() * .3,
            b: .7 + Math.random() * .3,
        }
        this.resetFixes();
    }

    move(t, x, y){
        if(this.playerdelay == 0){
            this.playerdelay = Date.now() - t;
        }
        this.lastupdated = t;
        this.x = x;
        this.y = y;
    }

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
}

module.exports = Player;