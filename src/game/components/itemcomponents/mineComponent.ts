import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

import SharedConfig from "../../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;

/** An Item Component that allows the item to be used to mine/destroy blocks */
class MineComponent extends Component<Item> {
    private minetype: number;
    private power: number;

    constructor(minetype: number, power?: number){
        super();
        this.minetype = minetype;
        this.power = power || 1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Item): void {
        super.setParent(parent);
        this.getParent().registerUseListener((stack: ItemStack, game: Game, player: Player, info: any) => this.use(stack, game, player, info));
    }

    /** Defines the mine use of the item with this component */
    use(stack: ItemStack, game: Game, player: Player, info: any): void {
        if(info.dist > BASE_REACH) return;

        const cell = game.world.getCell(info.cellpos.x, info.cellpos.y, false);
        if(cell !== null){
            if(cell.block !== null)
                if(cell.block.minetype != this.minetype || cell.block.hardness > this.power) return;
        }
        
        game.world.breakBlock(info.cellpos.x, info.cellpos.y, true);
    }
}

export default MineComponent;