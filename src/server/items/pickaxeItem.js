const Constants = require('../../shared/constants.js');
const Item = require('./item.js');

class PickaxeItem extends Item {
    constructor(id){
        super(id);
        this.itemid = 2;
        this.name = "Pickaxe";
        this.break = true;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }
}

module.exports = PickaxeItem;