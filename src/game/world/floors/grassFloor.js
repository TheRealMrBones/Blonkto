const Floor = require('../floor.js');

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class GrassFloor extends Floor {
    static id = 1;

    constructor(){
        super();
        this.asset = ASSETS.GRASS_FLOOR;
    }
}

module.exports = GrassFloor;