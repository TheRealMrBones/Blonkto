import Game from "../../game.js";
import Layer from "../../world/layer.js";

/** The base interface for objects that can drop items on the ground */
interface IDrop {
    /** Calculates and drops the specified amounts of items */
    drop(layer: Layer, x: number, y: number, game: Game): void
}

export default IDrop;
