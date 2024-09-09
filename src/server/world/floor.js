const Constants = require('../../shared/constants.js');

class Floor {
    constructor(){
        this.id = 0;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    serializeForLoad(){
        return {
            asset: this.asset,
        }
    }

    serializeForWrite(){
        return this.id.toString();
    }
}

module.exports = Floor;