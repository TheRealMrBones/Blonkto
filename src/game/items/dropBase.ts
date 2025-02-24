import Game from "../game.js";

interface DropBase {
    /** Calculates and drops the specified amounts of items */
    drop(x: number, y: number, game: Game): void
}

export default DropBase;