const Constants = require('../../shared/constants.js');
const Floor = require('./floor.js');
const Block = require('./block.js');
const Ceiling = require('./ceiling.js');

class Cell {
    constructor(){
        this.floor = new Floor();
        this.block = new Block();
        this.ceiling = new Ceiling();
    }

    serializeForLoad(){
        return {
            floor: this.floor.serializeForLoad(),
            block: this.block.serializeForLoad(),
            ceiling: this.ceiling.serializeForLoad(),
        }
    }
}

module.exports = Cell;