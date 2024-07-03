const Constants = require('../../shared/constants.js');

class Floor {
    constructor(){
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    serializeForLoad(){
        return {
            asset: this.asset,
        }
    }
}

module.exports = Floor;