const Item = require('./item.js');

class SwordItem extends Item {
    constructor(id){
        this.name = "Sword";
        this.attack = 2;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }
}

module.exports = SwordItem;