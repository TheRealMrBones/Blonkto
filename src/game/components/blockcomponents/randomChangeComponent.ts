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
            for(const object of block.cell.chunk.layer.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t[0] == block.cell.getWorldX() && t[1] == block.cell.getWorldY())) return;
            }
        }

        block.cell.setBlock(this.newblock, game);
    }
}

export default RandomChangeComponent;
