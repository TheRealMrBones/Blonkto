import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import Block from "../../world/block.js";
import Cell from "../../world/cell.js";
import DroppedStack from "../../objects/droppedStack.js";

/** A Block Component that allows the block to be picked up */
class PickupComponent extends Component<Block> {
    private item: string;
    private amount: number;

    constructor(item: string, amount: number){
        super();
        this.item = item;
        this.amount = amount || 1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Block): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("interact", (game: Game, player: Player, cell: Cell, info: any) => this.interact(game, player, cell, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(game: Game, player: Player, cell: Cell, info: any): void {
        cell.setBlock(null);
        const itemstack = new ItemStack(this.item, this.amount);
        if(player.inventory.collectStack(itemstack)) return;
        DroppedStack.dropWithSpread(game, info.cellpos.x, info.cellpos.y, itemstack, .3, player);
    }
}

export default PickupComponent;