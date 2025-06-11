import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

import SharedConfig from "../../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to mine/destroy floors */
class MineFloorComponent extends Component<Item> {
    private power: number;

    constructor(power: number){
        super();
        this.power = power;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.getParent().eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the mine use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        if(info.dist > BASE_REACH) return;
        game.world.breakFloor(info.cellpos.x, info.cellpos.y, true);
    }
}

export default MineFloorComponent;