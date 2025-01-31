const Block = require('../block.js');

import Constants from '../../shared/constants';
const { ASSETS,SHAPES } = Constants;

class StoneBlock extends Block {
    static id = 1;

    constructor(){
        super();
        this.asset = ASSETS.STONE_BLOCK;
        this.scale = 1;
        this.shape = SHAPES.SQUARE;
    }
}

module.exports = StoneBlock;