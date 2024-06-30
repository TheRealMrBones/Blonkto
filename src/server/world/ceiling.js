const Constants = require('../../shared/constants.js');

class Ceiling {
    constructor(){
        this.exists = true;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    serializeForLoad(){
        return {
            exists: this.exists,
            asset: this.asset,
        }
    }
}

module.exports = Ceiling;