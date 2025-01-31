const NonplayerEntity = require('./nonplayerEntity.js');

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

import SharedConfig from '../../configs/shared';
const { PLAYER_SCALE } = SharedConfig.PLAYER;

class Pig extends NonplayerEntity {
    constructor(id, x, y, dir){
        super(id, x, y, dir);

        this.asset = ASSETS.PIG;
        this.scale = PLAYER_SCALE;

        this.health = 3;

        this.ontick.on("tick", (dt) => {
            
        });
    }
}

module.exports = Pig;