const Constants = require('../../../shared/constants.js');
const Floor = require('../floor.js');

class GrassFloor extends Floor {
    static id = 1;

    constructor(){
        super();
        this.asset = Constants.ASSETS.GRASS_FLOOR;
    }
}

module.exports = GrassFloor;