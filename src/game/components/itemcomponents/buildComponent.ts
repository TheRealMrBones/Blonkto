import Component from "../component.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import ItemStack from "../../items/itemStack.js";
import FloorDefinition from "../../definitions/floorDefinition.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

import SharedConfig from "../../../configs/shared.js";
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
        const layer = game.world.getLayer(player.layer);

        if(info.cell !== null) if(!layer.cellEmpty(info.cell.getWorldX(), info.cell.getWorldY())) return;
        if(info.dist > BASE_REACH) return;

        if(info.cell === null) return;
        if(info.cell.floor === null) return;
        
        if(this.floorrequirements.length > 0){
            for(const requirement of this.floorrequirements){
                if(!info.cell.floor.definition.hasComponent(requirement)) return;
            }
        }

        if(info.cell.placeBlock(this.block, game)) player.removeFromCurrentSlot(1);
    }
}

export default BuildComponent;
