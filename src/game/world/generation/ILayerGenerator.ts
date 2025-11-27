import Game from "game/game.js";
import Chunk from "game/world/chunk.js";
import Layer from "game/world/layer.js";

/** Base interface for layer generator classes that create new chunks */
interface ILayerGenerator {
    /** Generates a new chunk at the given coordinates */
    generateChunk(layer: Layer, chunkx: number, chunky: number, game: Game): Chunk;
}

export default ILayerGenerator;
