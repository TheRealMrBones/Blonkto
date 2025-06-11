import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

/** An Item Component that allows the item to be used to attack entities */
class AttackComponent extends Component<Item> {
    private damage: number;

    constructor(damage: number){
        super();
        this.damage = damage;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: any) => this.use(stack, game, player, info));
    }

    /** Defines the attack use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: any): void {
        player.startSwing(info.dir, this.damage);
    }
}

export default AttackComponent;