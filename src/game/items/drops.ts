import Game from "../game.js";
import DropBase from "./dropBase.js";

/** Drop composed of multiple other drops */
class Drops implements DropBase {
    drops: DropBase[];

    constructor(...drops: DropBase[]){
        this.drops = drops;
    }

    /** Calculates and drops the specified amounts of items */
    drop(x: number, y: number, game: Game): void {
        this.drops.forEach(d => d.drop(x, y, game));
    }

    /** Adds a new drop to this drop collection */
    addDrop(drop: DropBase): void {
        this.drops.push(drop);
    }
}

export default Drops;