import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

import Constants from "../../../shared/constants.js";
const { GAME_MODES } = Constants;

/** An Item Component that allows the item to be consumed by players */
class EatComponent extends Component<ItemDefinition> {
    private heal: number;

    constructor(heal: number){
        super();
        this.heal = heal;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.interact(stack, game, player, info));
    }

    /** Defines the eat use of the item with this component */
    interact(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        if(!player.canHeal()) return;

        if(player.getGamemode() != GAME_MODES.CREATIVE) player.removeFromCurrentSlot(1);
        player.heal(this.heal);

        player.setImmediateAction(true);
    }
}

export default EatComponent;
