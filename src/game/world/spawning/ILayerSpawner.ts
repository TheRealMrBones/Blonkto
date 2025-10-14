import Game from "../../game.js";
import Chunk from "../chunk.js";
import Layer from "../layer.js";

/** Base interface for layer spawner classes that spawn entities in a layer */
interface ILayerSpawner {
    /** Ticks spawning in the given layer */
    tickSpawning(layer: Layer, game: Game): void;

    /** Populates the given newly generated chunk */
    populateChunk(chunk: Chunk, game: Game): void;

    /** Does repopulate checks on the given loaded chunk */
    repopulateChunk(chunk: Chunk, game: Game, entitiesdata: any[]): void;
}

export default ILayerSpawner;
