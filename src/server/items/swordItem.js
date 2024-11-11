const Constants = require('../../shared/constants.js');
const Item = require('./item.js');

class SwordItem extends Item {
    static itemid = 3;

    constructor(id){
        super(id);
        
        this.name = "Sword";
        this.attack = 2;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }
}

module.exports = SwordItem;