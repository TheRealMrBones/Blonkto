import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";

/** A Block Component that allows the block to move a player up or down a world layer */
class StairsComponent extends Component<BlockDefinition> {
    private readonly down: boolean;
    private readonly partnerblock: string;

    constructor(down: boolean, partnerblock: string){
        super();

        this.down = down;
        this.partnerblock = partnerblock;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
        this.getParent().registerInstantiateListener((block: Block, game: Game) => this.instantiate(block, game));
        this.getParent().registerBreakListener((block: Block, game: Game, drop: boolean) => this.break(block, game, drop));
    }

    /** Defines the interaction event of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        if(Math.floor(player.x) != block.cell.getWorldX() || Math.floor(player.y) != block.cell.getWorldY()) return;

        const newz = player.layer.z + (this.down ? 1 : -1);
        const newlayer = game.world.getLayer(newz);
        if(newlayer === undefined) return;

        player.setLayer(newlayer);
        player.updateLastChunk(null); // force chunk reload
    }

    /** Defines the instantiate event of the block with this component */
    instantiate(block: Block, game: Game): void {
        if(!this.down) return;

        const newz = block.cell.chunk.layer.z + (this.down ? 1 : -1);
        const newlayer = game.world.getLayer(newz);
        if(newlayer === undefined) return;

        const newcell = newlayer.getCell(block.cell.getWorldX(), block.cell.getWorldY(), true);
        if(newcell === null) return;

        if(newcell.block !== null){
            if(newcell.block.definition.key != this.partnerblock){
                newcell.breakBlock(true, game);
                newcell.setBlock(this.partnerblock, game);
            }
        }else{
            newcell.setBlock(this.partnerblock, game);
        }
    }

    /** Defines the break event of the block with this component */
    break(block: Block, game: Game, drop: boolean): void {
        if(!this.down) return;

        const newz = block.cell.chunk.layer.z + (this.down ? 1 : -1);
        const newlayer = game.world.getLayer(newz);
        if(newlayer === undefined) return;

        const newcell = newlayer.getCell(block.cell.getWorldX(), block.cell.getWorldY(), true);
        if(newcell === null) return;

        if(newcell.block !== null)
            if(newcell.block.definition.key == this.partnerblock) newcell.breakBlock(drop, game);
    }
}

export default StairsComponent;
