import Component from "../component.js";
import Game from "../../game.js";
import Block from "../../world/block.js";
import Cell from "../../world/cell.js";
import { Pos } from "../../../shared/types.js";

/** A Block Component that allows the block to be changed after random amount of ticks */
class RandomChangeComponent extends Component<Block> {
    private newblock: string;
    private cancollide: boolean;
    private chance: number;

    constructor(newblock: string, cancollide?: boolean, chance?: number){
        super();
        this.newblock = newblock;
        this.cancollide = cancollide || false;
        this.chance = chance || 0.001;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Block): void {
        super.setParent(parent);
        this.getParent().eventEmitter.on("tick", (cell: Cell, game: Game, dt: number) => this.tick(cell, game, dt));
    }

    /** Defines the tick action of the block with this component */
    tick(cell: Cell, game: Game, dt: number): void {
        if(Math.random() > this.chance) return;

        if(!this.cancollide){
            for(const object of game.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t.x == cell.getWorldX() && t.y == cell.getWorldY())) return;
            }
        }

        game.world.setBlock(cell.getWorldX(), cell.getWorldY(), this.newblock);
    }
}

export default RandomChangeComponent;