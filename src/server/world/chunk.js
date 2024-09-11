const Constants = require('../../shared/constants.js');
const Cell = require('./cell.js');
const GrassFloor = require('./floors/grassFloor.js');
const StoneBlock = require('./blocks/stoneBlock.js');

class Chunk {
    constructor(chunkx, chunky, data){
        this.chunkx = chunkx;
        this.chunky = chunky;

        const chunkdata = data === undefined ? false : data.split("|");

        this.cells = [];

        // try to read file if exists
        let noread = data === undefined;
        if(data !== undefined){
            try{
                for(let x = 0; x < Constants.CHUNK_SIZE; x++){
                    this.cells[x] = [];
                    for(let y = 0; y < Constants.CHUNK_SIZE; y++){
                        this.cells[x][y] = new Cell();
                        
                        const celldata = chunkdata[x * Constants.CHUNK_SIZE + y].split(",");
                        if(parseInt(celldata[0]) == 1){
                            this.cells[x][y].floor = new GrassFloor();
                        }
                        if(parseInt(celldata[1]) == 1){
                            this.cells[x][y].block = new StoneBlock();
                        }
                    }
                }
            }catch(e){
                // read failed just generate new chunk
                noread = true;
            }
        }

        // generate new chunk if file doesnt exist
        if(noread){
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

        this.cellUpdates = [];
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

    serializeForWrite(){
        let data = "";
        for(let x = 0; x < Constants.CHUNK_SIZE; x++){
            for(let y = 0; y < Constants.CHUNK_SIZE; y++){
                data += this.cells[x][y].serializeForWrite() + "|";
            }
        }

        return data;
    }
}

module.exports = Chunk;