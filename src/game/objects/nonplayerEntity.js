import EventEmitter from 'events';

import Entity from './entity.js';

class NonplayerEntity extends Entity {
    constructor(x, y, dir){
        super(x, y, dir);
        this.ontick = new EventEmitter();

        this.ontick.on("tick", (dt) => {});
    }
}

export default NonplayerEntity;