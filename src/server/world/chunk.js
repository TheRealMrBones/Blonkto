const Constants = require('../../shared/constants.js');
const Cell = require('./cell.js');
const { GetCellObject } = require('./cells.js');
const GrassFloor = require('./floors/grassFloor.js');
const StoneBlock = require('./blocks/stoneBlock.js');

class Chunk {
    constructor(chunkx, chunky, data){
        this.chunkx = chunkx;
        this.chunky = chunky;

        this.cells = [];

        // try to read file if exists
        let noread = data === undefined;
        if(!noread){
            const chunkdata = data.split("|");
            
            try{
                for(let x = 0; x < Constants.CHUNK_SIZE; x++){
                    this.cells[x] = [];
                    for(let y = 0; y < Constants.CHUNK_SIZE; y++){
                        const celldata = chunkdata[x * Constants.CHUNK_SIZE + y].split(",");
                        
                        this.cells[x][y] = GetCellObject(parseInt(celldata[0]), parseInt(celldata[1]), parseInt(celldata[2]));
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

    // #region serialization

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

    // #endregion
}

module.exports = Chunk;