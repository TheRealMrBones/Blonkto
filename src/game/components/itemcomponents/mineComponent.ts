import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

import Constants from "../../../shared/constants.js";
const { MINE_TYPES } = Constants;

/** An Item Component that allows the item to be used to mine/destroy blocks */
class MineComponent extends Component<Item> {
    private power: number;
    private minetype: number;

    constructor(power: number, minetype?: number){
        super();
        this.power = power;
        this.minetype = minetype || MINE_TYPES.MINE;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the mine use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any): void {
        const cell = game.world.getCell(info.cellpos.x, info.cellpos.y, false);
        if(cell !== null){
            if(cell.block !== null)
                if(cell.block.minetype != this.minetype) return;
        }
        game.world.breakBlock(info.cellpos.x, info.cellpos.y, true);
    }
}

export default MineComponent;