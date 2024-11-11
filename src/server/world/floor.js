const Constants = require('../../shared/constants.js');

class Floor {
    static id = 0;

    constructor(){
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
        }
    }

    serializeForWrite(){
        return this.constructor.id.toString();
    }

    // #endregion
}

module.exports = Floor;