import Cell from './cell.js';

import SharedConfig from '../../configs/shared.js';
const { CHUNK_SIZE } = SharedConfig.WORLD;

class Chunk {
    chunkx: number;
    chunky: number;
    cells: Array<Array<Cell>>;
    cellUpdates: Array<any>;

    constructor(chunkx: number, chunky: number, data?: string){
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.cellUpdates = [];

        this.cells = [];

        if(data !== undefined){
            // try to read file if exists
            const chunkdata = data.split("\n");
            
            try{
                for(let x = 0; x < CHUNK_SIZE; x++){
                    this.cells[x] = [];
                    for(let y = 0; y < CHUNK_SIZE; y++){
                        const celldata = JSON.parse(chunkdata[x * CHUNK_SIZE + y]);
                        
                        this.cells[x][y] = new Cell(
                            celldata.block ? celldata.block.name : null,
                            celldata.floor ? celldata.floor.name : null,
                            celldata.ceiling ? celldata.ceiling.name : null);
                    }
                }
            }catch(e){
                console.log(`Chunk ${this.chunkx},${this.chunky} failed to load. File may have been corrupted`);

                // read failed just generate new chunk
                return new Chunk(chunkx, chunky);
            }
        }else{
            // generate new chunk if file doesnt exist
            for(let x = 0; x < CHUNK_SIZE; x++){
                this.cells[x] = [];
                for(let y = 0; y < CHUNK_SIZE; y++){
                    let block: string | null = null;

                    if(Math.random() < .1){
                        block = "stone_block";
                    }
                    
                    this.cells[x][y] = new Cell(block, "grass_floor", null);
                }
            }
        }
    }

    // #region serialization

    serializeForLoad(){
        const serializedCells: Array<Array<any>> = [];
        for(let x = 0; x < CHUNK_SIZE; x++){
            serializedCells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
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
        for(let x = 0; x < CHUNK_SIZE; x++){
            for(let y = 0; y < CHUNK_SIZE; y++){
                data += JSON.stringify(this.cells[x][y].serializeForWrite()) + "\n";
            }
        }

        return data;
    }

    // #endregion
}

export default Chunk;