import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";

/** Base interface for layer generator classes that create new chunks */
interface ILayerGenerator {
    /** Generates a new chunk at the given coordinates */
    generateChunk(layer: Layer, chunkx: number, chunky: number, game: Game): Chunk;
}

export default ILayerGenerator;
