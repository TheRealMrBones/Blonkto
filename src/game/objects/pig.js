import NonplayerEntity from './nonplayerEntity.js';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

import SharedConfig from '../../configs/shared';
const { PLAYER_SCALE } = SharedConfig.PLAYER;

class Pig extends NonplayerEntity {
    constructor(x, y, dir){
        super(x, y, dir);

        this.asset = ASSETS.PIG;
        this.scale = PLAYER_SCALE;

        this.health = 3;

        this.ontick.on("tick", (dt) => {
            
        });
    }
}

export default Pig;