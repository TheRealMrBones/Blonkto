const ObjectClass = require('./object.js');

class Player extends ObjectClass {
    constructor(id, socket, username, x, y, dir){
        super(id, x, y, dir);
        this.socket = socket;
        this.username = username;
        this.dead = false;
        this.kills = 0;
        this.lastshot = Date.now();
        this.lastupdated = Date.now();
        this.playerdelay = 0;
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
            pushx: 0,
            pushy: 0,
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
        return {
            ...(super.serializeForUpdate()),
            username: this.username,
            lastupdated: this.lastupdated,
            playerdelay: this.playerdelay,
        };
    }
}

module.exports = Player;