const Constants = require('../../shared/constants.js');

class Block {
    constructor(){
        this.exists = true;
        this.asset = Constants.ASSETS.TILE;
    }

    serializeForLoad(){
        return {
            exists: this.exists,
            asset: this.asset,
        }
    }
}

module.exports = Block;