import ILayerGenerator from "./ILayerGenerator.js";
import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";
import multiNumberHash from "../../../shared/random/multiNumberHash.js";
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
        const seed = multiNumberHash(chunkx, chunky, layer.seed);
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

        const cavecheckdist = 1;
        for(let dx = -cavecheckdist; dx <= cavecheckdist; dx++){
            for(let dy = -cavecheckdist; dy <= cavecheckdist; dy++){
                this.generateCaves(chunk, chunkx + dx, chunky + dy, game);
            }
        }

        return chunk;
    }

    // Generates caves in the requested other chunk and does cell operations on the given chunk
    generateCaves(chunk: Chunk, otherchunkx: number, otherchunky: number, game: Game): void {
        const seed = multiNumberHash(otherchunkx, otherchunky, chunk.layer.seed);
        const rng = new SeededRandom(seed);

        for(let dx = 0; dx < CHUNK_SIZE; dx++){
            for(let dy = 0; dy < CHUNK_SIZE; dy++){
                if(rng.next() < .0025) this.generateCave(chunk, rng, dx + otherchunkx * CHUNK_SIZE, dy + otherchunky * CHUNK_SIZE, game);
            }
        }
    }

    // Generates cave with the given rng at the requested pos and does cell operation on the given chunk
    generateCave(chunk: Chunk, rng: SeededRandom, cavex: number, cavey: number, game: Game): void {
        const size = rng.nextInt(2, 6);

        for(let dx = -size; dx <= size; dx++){
            for(let dy = -size; dy <= size; dy++){
                const dist = Math.sqrt(dx * dx + dy * dy);
                if(dist > size + .5) continue;
                
                const relativex = cavex + dx - chunk.chunkx * CHUNK_SIZE;
                const relativey = cavey + dy - chunk.chunky * CHUNK_SIZE;
                if(relativex < 0 || relativex >= CHUNK_SIZE || relativey < 0 || relativey >= CHUNK_SIZE) continue;

                chunk.cells[relativex][relativey].setBlock(null, game);
            }
        }
    }
}

export default CaveLayerGenerator;
