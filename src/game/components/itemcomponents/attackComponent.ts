import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { attackHitCheck } from "../../collisions.js";

/** An Item Component that alows the item to be used to attack entities */
class AttackComponent extends Component<Item> {
    damage: number;

    constructor(damage: number){
        super();
        this.damage = damage;
    }

    /** Implements this component into its parents functionality */
    setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the attack use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        player.attack(info.dir);
        attackHitCheck(player, game.getEntities(), info.dir, this.damage);
    }
}

export default AttackComponent;