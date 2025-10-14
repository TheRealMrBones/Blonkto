import Component from "../component.js";
import Game from "../../game.js";
import Player from "../../objects/player.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import { ClickContentExpanded } from "../../managers/socketManager.js";
import Station from "../../items/station.js";
import ComponentData from "../componentData.js";

/** A Block Component that allows the block to be opened as a station */
class StationComponent extends Component<BlockDefinition> {
    constructor(){
        super();
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(StationComponentData, this);

        this.getParent().registerInteractListener((block: Block, game: Game, player: Player, info: ClickContentExpanded) => this.interact(block, game, player, info));
        this.getParent().registerTickListener((block: Block, game: Game, dt: number) => this.tick(block, game, dt));
    }

    /** Defines the station open interaction of the block with this component */
    interact(block: Block, game: Game, player: Player, info: ClickContentExpanded): void {
        const data = block.getComponentData(StationComponentData);
        data.station.openStation(player);
    }

    /** Defines the tick of the block with this component */
    tick(block: Block, game: Game, dt: number): void {
        const data = block.getComponentData(StationComponentData);

        data.station.checkOpeners(game);
    }
}

export class StationComponentData extends ComponentData<StationComponent> {
    station: Station;

    constructor(parent: StationComponent){
        super(parent);

        this.station = new Station(parent.getParent().key);
    }
}

export default StationComponent;
