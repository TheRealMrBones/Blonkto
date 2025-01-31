import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class Floor {
    static id = 0;

    constructor(){
        this.asset = ASSETS.MISSING_TEXTURE;
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