import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

import SharedConfig from "../../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;

import Constants from "../../../shared/constants.js";
const { MINE_TYPES } = Constants;

/** An Item Component that allows the item to be used to mine/destroy blocks */
class MineComponent extends Component<ItemDefinition> {
    private minetype: number;
    private power: number;

    constructor(minetype: number, power?: number){
        super();
        this.minetype = minetype;
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

        const cell = game.world.getCell(info.cellpos.x, info.cellpos.y, false);
        if(cell !== null){
            if(cell.block !== null)
                if((cell.block.definition.minetype !== MINE_TYPES.ANY && cell.block.definition.minetype != this.minetype)
                    || cell.block.definition.hardness > this.power) return;
        }
        
        game.world.breakBlock(info.cellpos.x, info.cellpos.y, true);
    }
}

export default MineComponent;
