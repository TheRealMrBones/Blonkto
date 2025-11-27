import SharedConfig from "configs/shared.js";
import Component from "game/components/component.js";
import ItemDefinition from "game/definitions/itemDefinition.js";
import Game from "game/game.js";
import ItemStack from "game/items/itemStack.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";

const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to mine/destroy floors */
class MineFloorComponent extends Component<ItemDefinition> {
    private power: number;

    constructor(power?: number){
        super();
        this.power = power || 1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: ItemDefinition): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => this.use(stack, game, player, info));
    }

    /** Defines the mine use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): void {
        if(info.dist > BASE_REACH) return;

        if(info.cell === null) return;
        if(info.cell.floor === null) return;
        if(info.cell.floor.definition.hardness > this.power) return;

        if(info.cell.breakFloor(true, game)) player.setImmediateAction(true);
    }
}

export default MineFloorComponent;
