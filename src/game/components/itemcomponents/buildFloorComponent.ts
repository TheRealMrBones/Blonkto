import SharedConfig from "configs/shared.js";
import Component from "game/components/component.js";
import ItemDefinition from "game/definitions/itemDefinition.js";
import Game from "game/game.js";
import ItemStack from "game/items/itemStack.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Constants from "shared/constants.js";

const { GAME_MODES } = Constants;
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
