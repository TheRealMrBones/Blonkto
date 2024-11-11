const Constants = require('../../shared/constants.js');

class Ceiling {
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

module.exports = Ceiling;