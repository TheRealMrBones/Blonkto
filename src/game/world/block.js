import Constants from '../../shared/constants';
const { ASSETS, SHAPES } = Constants;

class Block {
    static id = 0;

    constructor(){
        this.asset = ASSETS.MISSING_TEXTURE;
        this.scale = 1;
        this.shape = SHAPES.SQUARE;
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

export default Block;