import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

/** An Item Component that allows the item to be used to attack entities */
class AttackComponent extends Component<Item> {
    damage: number;

    constructor(damage: number){
        super();
        this.damage = damage;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the attack use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        player.startSwing(info.dir);
    }
}

export default AttackComponent;