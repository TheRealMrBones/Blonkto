const NonplayerEntity = require('./nonplayerEntity.js');
const Constants = require('../../shared/constants.js');

class Pig extends NonplayerEntity {
    constructor(id, x, y, dir){
        super(id, x, y, dir);

        this.asset = Constants.ASSETS.PIG;
        this.scale = Constants.PLAYER_SCALE;

        this.health = 3;
    }
}

module.exports = Pig;