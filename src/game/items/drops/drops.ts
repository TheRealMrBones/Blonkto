import Game from "../../game.js";
import Layer from "../../world/layer.js";
import IDrop from "./IDrop.js";

/** Drop composed of multiple other drops */
class Drops implements IDrop {
    drops: IDrop[];

    constructor(...drops: IDrop[]){
        this.drops = drops;
    }

    /** Calculates and drops the specified amounts of items */
    drop(layer: Layer, x: number, y: number, game: Game): void {
        this.drops.forEach(d => d.drop(layer, x, y, game));
    }

    /** Adds a new drop to this drop collection */
    addDrop(drop: IDrop): void {
        this.drops.push(drop);
    }
}

export default Drops;
