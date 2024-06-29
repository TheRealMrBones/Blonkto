const Constants = require('../shared/constants.js');

class Cell {
    constructor(){
        this.floor = Constants.ASSETS.GRASS_TILE;
    }

    serializeForLoad(){
        return {
            floor: this.floor,
        }
    }
}

module.exports = Cell;