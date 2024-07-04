const Constants = require('../../shared/constants.js');

class Block {
    constructor(){
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
        this.scale = 1;
        this.shape = Constants.SHAPES.SQUARE;
    }

    serializeForLoad(){
        return {
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
        }
    }
}

module.exports = Block;