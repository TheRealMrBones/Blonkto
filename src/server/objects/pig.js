const Entity = require('./entity.js');
const Constants = require('../../shared/constants.js');

class Pig extends Entity {
    constructor(id, x, y, dir, data){
        super(id, x, y, dir);
    }
}

module.exports = Pig;