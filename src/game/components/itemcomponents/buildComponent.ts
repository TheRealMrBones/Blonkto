import SharedConfig from "configs/shared.js";
import Component from "game/components/component.js";
import FloorDefinition from "game/definitions/floorDefinition.js";
import ItemDefinition from "game/definitions/itemDefinition.js";
import Game from "game/game.js";
import ItemStack from "game/items/itemStack.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Constants from "shared/constants.js";

const { GAME_MODES } = Constants;
const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to place blocks */
class BuildComponent extends Component<ItemDefinition> {
    private block: string;
    private floorrequirements: (new (...args: any[]) => Component<FloorDefinition>)[];

    constructor(block: string, floorrequirements?: (new (...args: any[]) => Component<FloorDefinition>)[]){
        super();
        this.block = block;
        this.floorrequirements = floorrequirements || [];
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.use(stack, game, player, info));
    }

    /** Defines the build use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        if(info.cell !== null) if(!player.layer.cellEmpty(info.cell.getWorldX(), info.cell.getWorldY())) return;
        if(info.dist > BASE_REACH) return;

        if(info.cell === null) return;
        if(info.cell.floor === null) return;

        if(this.floorrequirements.length > 0){
            for(const requirement of this.floorrequirements){
                if(!info.cell.floor.definition.hasComponent(requirement)) return;
            }
        }

        if(info.cell.placeBlock(this.block, game)){
            if(player.getGamemode() != GAME_MODES.CREATIVE) player.removeFromCurrentSlot(1);
            player.setImmediateAction(true);
        }
    }
}

export default BuildComponent;
