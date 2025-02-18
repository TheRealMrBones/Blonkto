import Entity from "./entity.js";

class NonplayerEntity extends Entity {
    constructor(x: number, y: number, dir: number){
        super(x, y, dir);
    }
}

export default NonplayerEntity;