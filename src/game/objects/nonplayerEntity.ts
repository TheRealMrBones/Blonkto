import EventEmitter from "events";

import Entity from "./entity.js";

class NonplayerEntity extends Entity {
    ontick: EventEmitter;

    constructor(x: number, y: number, dir: number){
        super(x, y, dir);
        this.ontick = new EventEmitter();

        this.ontick.on("tick", (dt: number) => {});
    }
}

export default NonplayerEntity;