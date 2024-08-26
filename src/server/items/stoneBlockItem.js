const Constants = require('../../shared/constants.js');
const Item = require('./item.js');

class StoneBlockItem extends Item {
    constructor(id){
        super(id)
        this.name = "Stone Block";
        this.place = true;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    getPlaced(){

    }
}

module.exports = StoneBlockItem;