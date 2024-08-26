const Item = require('./item.js');

class PickaxeItem extends Item {
    constructor(id){
        this.id = id;
        this.name = "Pickaxe";
        this.break = true;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }
}

module.exports = PickaxeItem;