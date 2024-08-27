const Constants = require('../../shared/constants.js');
const Item = require('./item.js');
const StoneBlock = require('../world/blocks/stoneBlock.js');

class StoneBlockItem extends Item {
    constructor(id){
        super(id)
        this.name = "Stone Block";
        this.place = true;
        this.asset = Constants.ASSETS.MISSING_TEXTURE;
    }

    getPlaced(){
        return new StoneBlock();
    }
}

module.exports = StoneBlockItem;