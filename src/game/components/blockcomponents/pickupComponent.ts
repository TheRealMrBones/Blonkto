import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import DroppedStack from "../../objects/droppedStack.js";
import Block from "../../world/block.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

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
        if(player.inventory.collectStack(itemstack)) return;
        DroppedStack.dropWithSpread(game, info.cellpos.x, info.cellpos.y, itemstack, .3, player.id);
    }
}

export default PickupComponent;