import Cell from "./cell.js";

import SharedConfig from "../../configs/shared.js";
import Game from "../game.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Represents a single chunk (square collection of cells) in the game world */
class Chunk {
    chunkx: number;
    chunky: number;
    cells: Cell[][];
    cellUpdates: any[];

    constructor(chunkx: number, chunky: number, generate: boolean, game: Game){
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.cellUpdates = [];

        this.cells = [];

        if(generate) this.generateChunk(game);
    }

    /** Returns the chunk from its save data */
    static readFromSave(chunkx: number, chunky: number, data: string, game: Game): Chunk {
        const chunk = new Chunk(chunkx, chunky, false, game);
        const chunkdata = data.split("\n");

        try{
            for(let x = 0; x < CHUNK_SIZE; x++){
                chunk.cells[x] = [];
                for(let y = 0; y < CHUNK_SIZE; y++){
                    const celldata = JSON.parse(chunkdata[x * CHUNK_SIZE + y]);
                    
                    chunk.cells[x][y] = new Cell(
                        celldata.basefloor ? celldata.basefloor.name : null,
                        celldata.block ? celldata.block.name : null,
                        celldata.ceiling ? celldata.ceiling.name : null,
                        celldata.floor ? celldata.floor.name : null
                    );
                }
            }
        }catch(e){
            console.log(`Chunk ${chunkx},${chunky} failed to load. File may have been corrupted`);

            // read failed just generate new chunk
            chunk.generateChunk(game);
            return chunk;
        }

        return chunk;
    }

    /** Generates new cell data for the chunk */
    generateChunk(game: Game){
        for(let x = 0; x < CHUNK_SIZE; x++){
            this.cells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
                let block: string | null = null;

                if(Math.random() < .1){
                    block = "stone_block";
                }else if(Math.random() < .02){
                    block = "tree_trunk";
                }else if(Math.random() < .005){
                    const pig = new NonplayerEntity(this.chunkx * CHUNK_SIZE + x + .5, this.chunky * CHUNK_SIZE + y + .5, 0, "pig");
                    game.entities[pig.id] = pig;
                }
                
                this.cells[x][y] = new Cell("grass_floor", block, null);
            }
        }
    }

    // #region serialization

    /** Return an object representing this chunks data for loading to the game world */
    serializeForLoad(): any {
        const serializedCells: any[][] = [];
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

    /** Return an object representing this chunks data for writing to the save */
    serializeForWrite(): any {
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