import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

import SharedConfig from "../../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to place floors */
class BuildFloorComponent extends Component<Item> {
    private floor: string;

    constructor(floor: string){
        super();
        this.floor = floor;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: any) => this.use(stack, game, player, info));
    }

    /** Defines the build use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: any): void {
        //if(!game.world.cellEmpty(info.cellpos.x, info.cellpos.y)) return;
        if(info.dist > BASE_REACH) return;

        if(game.world.placeFloor(info.cellpos.x, info.cellpos.y, this.floor)) player.removeFromCurrentSlot(1);
    }
}

export default BuildFloorComponent;