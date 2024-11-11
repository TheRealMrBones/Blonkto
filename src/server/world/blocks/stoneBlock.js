const Constants = require('../../../shared/constants.js');
const Block = require('../block.js');

class StoneBlock extends Block {
    static id = 1;

    constructor(){
        super();
        this.asset = Constants.ASSETS.STONE_BLOCK;
        this.scale = 1;
        this.shape = Constants.SHAPES.SQUARE;
    }
}

module.exports = StoneBlock;