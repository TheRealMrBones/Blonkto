const Constants = require('../../shared/constants.js');

class Floor {
    constructor(){
        this.exists = true;
        this.asset = Constants.ASSETS.GRASS_TILE;
    }

    serializeForLoad(){
        return {
            exists: this.exists,
            asset: this.asset,
        }
    }
}

module.exports = Floor;