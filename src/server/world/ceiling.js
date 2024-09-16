const Constants = require('../../shared/constants.js');

class Ceiling {
    constructor(){
        this.id = 0;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
        }
    }

    serializeForWrite(){
        return this.id.toString();
    }

    // #endregion
}

module.exports = Ceiling;