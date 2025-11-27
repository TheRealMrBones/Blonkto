import { SwingData } from "game/combat/swingData.js";
import Component from "game/components/component.js";
import ItemDefinition from "game/definitions/itemDefinition.js";
import Game from "game/game.js";
import ItemStack from "game/items/itemStack.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";

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
