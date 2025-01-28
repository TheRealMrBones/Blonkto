const Constants = require('../../shared/constants.js');
const Item = require('./item.js');
const StoneBlock = require('../world/blocks/stoneBlock.js');

class StoneBlockItem extends Item {
    static itemid = 1;

    constructor(id){
        super(id)

        this.name = "Stone Block";
        this.place = true;
        this.asset = Constants.ASSETS.STONE_BLOCK;
    }

    getPlaced(){
        return new StoneBlock();
    }
}

module.exports = StoneBlockItem;