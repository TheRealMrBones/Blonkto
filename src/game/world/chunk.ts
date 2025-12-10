import SharedConfig from "configs/shared.js";
import Game from "game/game.js";
import Cell from "game/world/cell.js";
import Layer from "game/world/layer.js";
import Logger from "server/logging/logger.js";
import Constants from "shared/constants.js";
import { SerializedLoadCell } from "shared/serialization/world/serializedCell.js";
import { SerializedLoadChunkFull, SerializedWriteChunk } from "shared/serialization/world/serializedChunk.js";

const { CHUNK_SIZE } = SharedConfig.WORLD;
const { LOG_CATEGORIES } = Constants;

/** Represents a single chunk (square collection of cells) in the game world */
class Chunk {
    private readonly logger: Logger;
    
    readonly layer: Layer;
    readonly chunkx: number;
    readonly chunky: number;
    readonly cells: Cell[][];
    cellupdates: any[];

    constructor(layer: Layer, chunkx: number, chunky: number){
        this.logger = Logger.getLogger(LOG_CATEGORIES.WORLD);

        this.layer = layer;
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.cellupdates = [];

        this.cells = [];
    }

    /** Returns the chunk from its save data */
    static readFromSave(layer: Layer, chunkx: number, chunky: number, data: string, game: Game): Chunk | null {
        const chunk = new Chunk(layer, chunkx, chunky);
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
            if(e instanceof Error)
                if(e.stack !== undefined) chunk.logger.error(e.stack);
            return null;
        }

        return chunk;
    }

    // #region unloading

    /** Ticks this chunk and all of its cells */
    tick(game: Game, dt: number): void {
        for(let x = 0; x < CHUNK_SIZE; x++){
            for(let y = 0; y < CHUNK_SIZE; y++){
                this.cells[x][y].emitTickEvent(game, dt);
            }
        }
    }

    /** Unloads this chunk and all of its cells */
    unload(game: Game): void {
        for(let x = 0; x < CHUNK_SIZE; x++){
            for(let y = 0; y < CHUNK_SIZE; y++){
                this.cells[x][y].emitUnloadEvent(game);
            }
        }
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this chunks data for loading to the client */
    serializeForLoad(): SerializedLoadChunkFull {
        const serializedCells: SerializedLoadCell[][] = [];
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
    serializeForWrite(): SerializedWriteChunk {
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
