import Component from "game/components/component.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import ItemStack from "game/items/itemStack.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import DroppedStack from "game/objects/droppedStack.js";
import Player from "game/objects/player.js";
import Block from "game/world/block.js";

/** A Block Component that allows the block to be picked up */
class PickupComponent extends Component<BlockDefinition> {
    private item: string;
    private amount: number;

    constructor(item: string, amount: number){
        super();
        this.item = item;
        this.amount = amount || 1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        block.cell.setBlock(null, game);
        const itemstack = new ItemStack(this.item, this.amount);
        player.setImmediateAction(true);

        if(player.getInventory().collectStack(itemstack)) return;
        DroppedStack.dropWithSpread(game, block.cell.chunk.layer, block.cell.getWorldX() + .5, block.cell.getWorldY() + .5, itemstack, .3, player.id);
    }
}

export default PickupComponent;
