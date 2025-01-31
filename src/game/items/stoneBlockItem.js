const Item = require('./item.js');
const StoneBlock = require('../world/blocks/stoneBlock.js');

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class StoneBlockItem extends Item {
    static itemid = 1;

    constructor(id){
        super(id)

        this.name = "Stone Block";
        this.place = true;
        this.asset = ASSETS.STONE_BLOCK;
    }

    getPlaced(){
        return new StoneBlock();
    }
}

module.exports = StoneBlockItem;