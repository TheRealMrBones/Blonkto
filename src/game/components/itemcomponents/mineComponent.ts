import Component from "../component.js";
import Item from "../../items/item.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";

/** An Item Component that alows the item to be used to mine/destroy blocks */
class MineComponent extends Component<Item> {
    power: number;

    constructor(power: number){
        super();
        this.power = power;
    }

    /** Implements this component into its parents functionality */
    setParent(parent: Item): void {
        super.setParent(parent);
        this.parent?.eventEmitter.on("use", (game: Game, player: Player, itemStack: ItemStack, info: any) => this.use(game, player, itemStack, info));
    }

    /** Defines the mine use of the item with this component */
    use(game: Game, player: Player, itemStack: ItemStack, info: any){
        game.world.breakcell(info.cellpos.x, info.cellpos.y, true);
    }
}

export default MineComponent;