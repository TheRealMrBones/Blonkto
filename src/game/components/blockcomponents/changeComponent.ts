import Component from "game/components/component.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Block from "game/world/block.js";

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
                if(object.tilesOn().some(t => t[0] == block.cell.getWorldX() && t[1] == block.cell.getWorldY())) return;
            }
        }

        block.cell.setBlock(this.newblock, game);
        player.setImmediateAction(true);
    }
}

export default ChangeComponent;
