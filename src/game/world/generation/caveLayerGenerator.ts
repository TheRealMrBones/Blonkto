import ILayerGenerator from "./ILayerGenerator.js";
import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";
import SeededRandom from "../../../shared/random/seededRandom.js";
import Cell from "../cell.js";

import SharedConfig from "../../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Generator object for a layer to create new chunks underground */
class CaveLayerGenerator implements ILayerGenerator {
    constructor(){

    }

    /** Generates a new chunk at the given coordinates */
    generateChunk(layer: Layer, chunkx: number, chunky: number, game: Game): Chunk {
        const seed = layer.rng.getSubSeed(chunkx + 123456789, chunky + 987654321);
        const rng = new SeededRandom(seed);

        const chunk = new Chunk(layer, chunkx, chunky);

        for(let x = 0; x < CHUNK_SIZE; x++){
            chunk.cells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
                const cell = new Cell(chunk, x, y, "stone_floor");
                cell.setBlock("stone_block", game);
                
                chunk.cells[x][y] = cell;
            }
        }

        return chunk;
    }
}

export default CaveLayerGenerator;
