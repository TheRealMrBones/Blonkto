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
    private swingduration: number;
    private actionduration: number;

    constructor(damage: number, knockback: number, swingduration: number, actionduration: number){
        super();
        this.damage = damage;
        this.knockback = knockback;
        this.swingduration = swingduration * 1000;
        this.actionduration = actionduration * 1000;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.use(stack, game, player, info));
    }

    /** Defines the attack use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        player.startSwing(this.getSwingData(info.dir));
    }

    /** Returns the swing data that this item creates */
    private getSwingData(dir: number): SwingData {
        return {
            dir: dir,
            swingduration:  this.swingduration,
            actionduration:  this.actionduration,
            damage: this.damage,
            knockback: this.knockback
        };
    }
}

export default AttackComponent;
