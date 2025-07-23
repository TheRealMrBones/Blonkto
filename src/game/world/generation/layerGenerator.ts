import ILayerGenerator from "./ILayerGenerator.js";
import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";
import SeededRandom from "../../../shared/random/seededRandom.js";
import Cell from "../cell.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";

import SharedConfig from "../../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Generator object for a layer to create new chunks */
class LayerGenerator implements ILayerGenerator {
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
                const cell = new Cell(chunk, x, y, "grass_floor");

                if(rng.next() < .05){
                    cell.setBlock("tree_trunk", game);
                }else if(rng.next() < .005){
                    cell.setBlock("stone_block", game);
                }else if(rng.next() < .01){
                    cell.setBlock("grown_carrots", game);
                }else if(rng.next() < .005){
                    const pig = new NonplayerEntity(layer, chunkx * CHUNK_SIZE + x + .5, chunky * CHUNK_SIZE + y + .5, 0, "pig");
                    layer.entityManager.addEntity(pig);
                }
                
                chunk.cells[x][y] = cell;
            }
        }

        return chunk;
    }
}

export default LayerGenerator;
