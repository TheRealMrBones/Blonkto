import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

/** A Block Component that allows the block to be changed on interact */
class ChangeComponent extends Component<BlockDefinition> {
    private newblock: string;
    private cancollide: boolean;

    constructor(newblock: string, cancollide?: boolean){
        super();
        this.newblock = newblock;
        this.cancollide = cancollide || false;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        if(!this.cancollide){
            for(const object of block.cell.chunk.layer.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t.x == block.cell.getWorldX() && t.y == block.cell.getWorldY())) return;
            }
        }

        block.cell.setBlock(this.newblock, game);
    }
}

export default ChangeComponent;
