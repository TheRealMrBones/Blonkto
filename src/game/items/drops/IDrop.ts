import Game from "../../game.js";

/** The base interface for objects that can drop items on the ground */
interface IDrop {
    /** Calculates and drops the specified amounts of items */
    drop(x: number, y: number, game: Game): void
}

export default IDrop;
