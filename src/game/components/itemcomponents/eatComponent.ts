import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

/** An Item Component that alows the item to be consumed by players */
class EatComponent extends Component<Item> {
    heal: number;

    constructor(heal: number){
        super();
        this.heal = heal;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the eat use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        player.removeFromCurrentSlot(1);
        player.heal(this.heal);
    }
}

export default EatComponent;