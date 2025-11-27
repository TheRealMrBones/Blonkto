import Component from "game/components/component.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Block from "game/world/block.js";

/** A Block Component that allows the block to be picked (aka break on interact) */
class PickComponent extends Component<BlockDefinition> {
    constructor(){
        super();
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        if(block.cell.breakBlock(true, game)) player.setImmediateAction(true);
    }
}

export default PickComponent;
