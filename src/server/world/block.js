const Constants = require('../../shared/constants.js');

class Block {
    constructor(){
        this.id = 0;
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
        return this.id.toString();
    }

    // #endregion
}

module.exports = Block;