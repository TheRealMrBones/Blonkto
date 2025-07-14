import Cell from "./cell.js";

import Game from "../game.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Represents a single chunk (square collection of cells) in the game world */
class Chunk {
    readonly chunkx: number;
    readonly chunky: number;
    readonly cells: Cell[][];
    cellupdates: any[];

    private constructor(chunkx: number, chunky: number){
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.cellupdates = [];

        this.cells = [];
    }

    /** Returns the chunk from its save data */
    static readFromSave(chunkx: number, chunky: number, data: string, game: Game): Chunk | null {
        const chunk = new Chunk(chunkx, chunky);
        const chunkdata = data.split("\n");

        try{
            for(let x = 0; x < CHUNK_SIZE; x++){
                chunk.cells[x] = [];
                for(let y = 0; y < CHUNK_SIZE; y++){
                    const celldata = JSON.parse(chunkdata[x * CHUNK_SIZE + y]);
                    const cell = Cell.readFromSave(chunk, x, y, celldata, game);
                    chunk.cells[x][y] = cell;
                }
            }
        }catch(e){
            return null;
        }

        return chunk;
    }

    // #region world generation

    /** Generates new cell data for the chunk */
    static generateChunk(chunkx: number, chunky: number, game: Game): Chunk {
        const chunk = new Chunk(chunkx, chunky);

        for(let x = 0; x < CHUNK_SIZE; x++){
            chunk.cells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
                const cell = new Cell(chunk, x, y, "grass_floor");

                if(Math.random() < .1){
                    cell.setBlock("stone_block", game);
                }else if(Math.random() < .02){
                    cell.setBlock("tree_trunk", game);
                }else if(Math.random() < .005){
                    cell.setBlock("grown_carrots", game);
                }else if(Math.random() < .0051){
                    const pig = new NonplayerEntity(chunkx * CHUNK_SIZE + x + .5, chunky * CHUNK_SIZE + y + .5, 0, "pig");
                    game.entityManager.entities.set(pig.id, pig);
                }
                
                chunk.cells[x][y] = cell;
            }
        }

        return chunk;
    }

    // #endregion

    // #region unloading

    /** Unloads this chunk and all of its cells */
    unload(game: Game): void {
        for(let x = 0; x < CHUNK_SIZE; x++){
            for(let y = 0; y < CHUNK_SIZE; y++){
                this.cells[x][y].unload(game);
            }
        }
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this chunks data for loading to the client */
    serializeForLoad(): any {
        const serializedCells: any[][] = [];
        const usedblocks: string[] = [];
        const usedfloors: string[] = [];
        const usedceilings: string[] = [];

        for(let x = 0; x < CHUNK_SIZE; x++){
            serializedCells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
                const serializedcell = this.cells[x][y].serializeForLoad();
                serializedCells[x][y] = serializedcell;

                if(serializedcell.block) if(!usedblocks.includes(serializedcell.block)) usedblocks.push(serializedcell.block);
                if(serializedcell.floor) if(!usedfloors.includes(serializedcell.floor)) usedfloors.push(serializedcell.floor);
                if(serializedcell.ceiling) if(!usedceilings.includes(serializedcell.ceiling)) usedceilings.push(serializedcell.ceiling);
            }
        }
        
        return {
            x: this.chunkx,
            y: this.chunky,
            cells: serializedCells,
            usedblocks: usedblocks,
            usedfloors: usedfloors,
            usedceilings: usedceilings,
        };
    }

    /** Returns an object representing this chunks data for writing to the save */
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