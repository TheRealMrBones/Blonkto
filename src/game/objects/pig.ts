import NonplayerEntity from "./nonplayerEntity.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE } = SharedConfig.PLAYER;

class Pig extends NonplayerEntity {
    constructor(x: number, y: number, dir: number){
        super(x, y, dir);

        this.asset = ASSETS.PIG;
        this.scale = PLAYER_SCALE;

        this.health = 3;
    }
}

export default Pig;