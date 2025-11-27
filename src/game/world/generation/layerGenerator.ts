import SharedConfig from "configs/shared.js";
import Game from "game/game.js";
import Cell from "game/world/cell.js";
import Chunk from "game/world/chunk.js";
import ILayerGenerator from "game/world/generation/ILayerGenerator.js";
import Layer from "game/world/layer.js";
import multiNumberHash from "shared/random/multiNumberHash.js";
import PerlinNoise from "shared/random/perlinNoise.js";
import SeededRandom from "shared/random/seededRandom.js";

const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Generator object for a layer to create new chunks */
class LayerGenerator implements ILayerGenerator {
    constructor(){

    }

    /** Generates a new chunk at the given coordinates */
    generateChunk(layer: Layer, chunkx: number, chunky: number, game: Game): Chunk {
        const layerrng = new SeededRandom(layer.seed);
        const layerperlinnoise = new PerlinNoise(layerrng.nextInt(0, SeededRandom.modulus), CHUNK_SIZE);
        const forestgrid = layerperlinnoise.generateGrid(32, 32, chunkx * CHUNK_SIZE, chunky * CHUNK_SIZE);

        const seed = multiNumberHash(chunkx, chunky, layer.seed);
        const rng = new SeededRandom(seed);

        const chunk = new Chunk(layer, chunkx, chunky);

        for(let x = 0; x < CHUNK_SIZE; x++){
            chunk.cells[x] = [];
            for(let y = 0; y < CHUNK_SIZE; y++){
                const cell = new Cell(chunk, x, y, "grass_floor");

                if(forestgrid[x][y] > 0 && rng.next() < .1){
                    cell.setBlock("tree_trunk", game);
                }else if(rng.next() < .005){
                    cell.setBlock("stone_block", game);
                }else if(rng.next() < .01){
                    cell.setBlock("grown_carrots", game);
                }

                chunk.cells[x][y] = cell;
            }
        }

        return chunk;
    }
}

export default LayerGenerator;
