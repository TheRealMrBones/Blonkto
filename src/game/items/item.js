const Constants = require('../../shared/constants.js');

class Item {
    static itemid = 0;

    constructor(id){
        this.id = id;

        this.name = "placeholder";
        this.break = false; // set to breaking info
        this.place = false; // set to type of object to place
        this.attack = false; // set to attack info
        this.asset = Constants.ASSETS.MISSING_TEXTURE; // default incase its never set
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

module.exports = Item;