import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

/** An Item Component that alows the item to be used to place blocks */
class BuildComponent extends Component<Item> {
    block: string;

    constructor(block: string){
        super();
        this.block = block;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the build use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        if(!game.world.cellEmpty(info.cellpos.x, info.cellpos.y)) return;

        if(game.world.placecell(info.cellpos.x, info.cellpos.y, this.block))
            player.removeFromSlot(player.hotbarslot, 1);
    }
}

export default BuildComponent;