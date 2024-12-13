const EventEmitter = require('events');

const Entity = require('./entity.js');
const Constants = require('../../shared/constants.js');

class NonplayerEntity extends Entity {
    constructor(id, x, y, dir){
        super(id, x, y, dir);
        const ontick = new EventEmitter();

        //ontick.on("tick", () => {});
    }
}

module.exports = NonplayerEntity;