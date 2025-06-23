import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";

/** A Block Component that allows the block to be changed on interact */
class ChangeComponent extends Component<BlockDefinition> {
    private newblock: string;
    private cancollide: boolean;

    constructor(newblock: string, cancollide?: boolean){
        super();
        this.newblock = newblock;
        this.cancollide = cancollide || false;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: any) => this.interact(block, game, player, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: any): void {
        if(!this.cancollide){
            for(const object of game.entityManager.getAllObjects()){
                if(object.tilesOn().some(t => t.x == info.cellpos.x && t.y == info.cellpos.y)) return;
            }
        }

        game.world.setBlock(info.cellpos.x, info.cellpos.y, this.newblock);
    }
}

export default ChangeComponent;