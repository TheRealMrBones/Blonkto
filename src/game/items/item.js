import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class Item {
    static itemid = 0;

    constructor(id){
        this.id = id;

        this.name = "placeholder";
        this.break = false; // set to breaking info
        this.place = false; // set to type of object to place
        this.attack = false; // set to attack info
        this.asset = ASSETS.MISSING_TEXTURE; // default incase its never set
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
        }
    }

    serializeForWrite(){
        return this.constructor.itemid.toString();
    }

    // #endregion
}

export default Item;