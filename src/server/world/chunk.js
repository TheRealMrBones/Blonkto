const Constants = require('../../shared/constants.js');
const Cell = require('./cell.js');
const GrassFloor = require('./floors/grassFloor.js');
const StoneBlock = require('./blocks/stoneBlock.js');

class Chunk {
    constructor(chunkx, chunky){
        this.chunkx = chunkx;
        this.chunky = chunky;

        this.cells = [];
        for(let x = 0; x < Constants.CHUNK_SIZE; x++){
            this.cells[x] = [];
            for(let y = 0; y < Constants.CHUNK_SIZE; y++){
                this.cells[x][y] = new Cell();
                this.cells[x][y].floor = new GrassFloor();
                if(Math.random() < .1){
                    this.cells[x][y].block = new StoneBlock();
                }
            }
        }
    }

    serializeForLoad(){
        const serializedCells = [];
        for(let x = 0; x < Constants.CHUNK_SIZE; x++){
            serializedCells[x] = [];
            for(let y = 0; y < Constants.CHUNK_SIZE; y++){
                serializedCells[x][y] = this.cells[x][y].serializeForLoad();
            }
        }
        
        return {
            x: this.chunkx,
            y: this.chunky,
            cells: serializedCells,
        };
    }
}

module.exports = Chunk;