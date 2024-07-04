const Constants = require('../../../shared/constants.js');
const Block = require('../block.js');

class StoneBlock extends Block {
    constructor(){
        super();
        this.asset = Constants.ASSETS.STONE_BLOCK;
        this.scale = 1;
        this.shape = Constants.SHAPES.CIRCLE;
    }
}

module.exports = StoneBlock;