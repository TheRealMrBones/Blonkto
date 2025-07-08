import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";
import SerializableForInit from "../serializableForInit.js";

/** A Block Component that allows the block to be opened as a station */
class StationComponent extends Component<BlockDefinition> implements SerializableForInit {
    constructor(){
        super();
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);

        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
    }

    /** Defines the station open interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        player.station = { x: info.cellpos.x, y: info.cellpos.y };
    }

    /** Returns an object representing this station component data for saving to the client */
    serializeForInit(): any {
        return {
            openinv: true,
        };
    }
}

export default StationComponent;