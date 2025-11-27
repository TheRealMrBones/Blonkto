import Game from "game/game.js";
import IDrop from "game/items/drops/IDrop.js";
import Layer from "game/world/layer.js";

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
