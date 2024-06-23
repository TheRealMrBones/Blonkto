const ObjectClass = require('./object.js');

class Player extends ObjectClass {
    constructor(id, socket, username, x, y, dir) {
        super(id, x, y, dir);
        this.socket = socket;
        this.username = username;
        this.dead = false;
        this.kills = 0;
        this.lastshot = Date.now();
        this.lastupdated = Date.now();
    }

    move(t, x, y){
        this.lastupdated = t;
        this.x = x;
        this.y = y;
    }

    serializeForUpdate() {
        return {
        ...(super.serializeForUpdate()),
        username: this.username,
        lastupdated: this.lastupdated,
        };
    }
}

module.exports = Player;