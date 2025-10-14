import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";
import { SwingData } from "../../combat/swingData.js";

/** An Item Component that allows the item to be used to attack entities */
class AttackComponent extends Component<ItemDefinition> {
    private damage: number;
    private knockback: number;

    constructor(damage: number, knockback: number){
        super();
        this.damage = damage;
        this.knockback = knockback;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.use(stack, game, player, info));
    }

    /** Defines the attack use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        player.startSwing(info.dir, this.getSwingData());
    }

    /** Returns the swing data that this item creates */
    private getSwingData(): SwingData {
        return {
            damage: this.damage,
            knockback: this.knockback
        };
    }
}

export default AttackComponent;
