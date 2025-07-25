import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

import SharedConfig from "../../../configs/shared.js";
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
        
        info.cell.breakFloor(true, game);
    }
}

export default MineFloorComponent;
