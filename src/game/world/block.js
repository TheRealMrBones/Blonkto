const Constants = require('../../shared/constants.js');

class Block {
    static id = 0;

    constructor(){
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
        this.scale = 1;
        this.shape = Constants.SHAPES.SQUARE;
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
        }
    }

    serializeForWrite(){
        return this.constructor.id.toString();
    }

    // #endregion
}

module.exports = Block;