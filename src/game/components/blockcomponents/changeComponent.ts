import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import Block from "../../world/block.js";
import Cell from "../../world/cell.js";

/** A Block Component that allows the block to be changed on interact */
class ChangeComponent extends Component<Block> {
    private newblock: string;
    private cancollide: boolean;

    constructor(newblock: string, cancollide?: boolean){
        super();
        this.newblock = newblock;
        this.cancollide = cancollide || false;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: Block): void {
        super.setParent(parent);
        this.getParent().eventEmitter.on("interact", (game: Game, player: Player, cell: Cell, info: any) => this.interact(game, player, cell, info));
    }

    /** Defines the pickup interaction of the block with this component */
    interact(game: Game, player: Player, cell: Cell, info: any): void {
        if(!this.cancollide){
            if(player.tilesOn().some(t => t.x == info.cellpos.x && t.y == info.cellpos.y)) return;
        }

        game.world.setBlock(info.cellpos.x, info.cellpos.y, this.newblock);
    }
}

export default ChangeComponent;