import Component from "../component.js";
import Game from "../../game.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";

/** A Block Component that allows the block to be changed after random amount of ticks */
class RandomChangeComponent extends Component<BlockDefinition> {
    private newblock: string;
    private cancollide: boolean;
    private chance: number;

    constructor(newblock: string, cancollide?: boolean, chance?: number){
        super();
        this.newblock = newblock;
        this.cancollide = cancollide || false;
        this.chance = chance || 0.0003;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerTickListener((block: Block, game: Game, dt: number) => this.tick(block, game, dt));
    }

    /** Defines the tick action of the block with this component */
    tick(block: Block, game: Game, dt: number): void {
        if(Math.random() > this.chance) return;

        if(!this.cancollide){
            for(const object of game.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t.x == block.cell.getWorldX() && t.y == block.cell.getWorldY())) return;
            }
        }

        game.world.setBlock(block.cell.getWorldX(), block.cell.getWorldY(), this.newblock);
    }
}

export default RandomChangeComponent;