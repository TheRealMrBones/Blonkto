const EventEmitter = require('events');

const Entity = require('./entity.js');

class NonplayerEntity extends Entity {
    constructor(id, x, y, dir){
        super(id, x, y, dir);
        this.ontick = new EventEmitter();

        this.ontick.on("tick", (dt) => {});
    }
}

module.exports = NonplayerEntity;