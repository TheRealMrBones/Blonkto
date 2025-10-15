import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

import Constants from "../../../shared/constants.js";
const { GAME_MODES } = Constants;

import SharedConfig from "../../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to place floors */
class BuildFloorComponent extends Component<ItemDefinition> {
    private floor: string;

    constructor(floor: string){
        super();
        this.floor = floor;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.use(stack, game, player, info));
    }

    /** Defines the build use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        //if(!game.world.cellEmpty(info.cellpos.x, info.cellpos.y)) return;
        if(info.dist > BASE_REACH) return;

        if(info.cell !== null){
            if(info.cell.placeFloor(this.floor, game)){
                if(player.getGamemode() != GAME_MODES.CREATIVE) player.removeFromCurrentSlot(1);
                player.setImmediateAction(true);
            }
        }
    }
}

export default BuildFloorComponent;
