import Component from "game/components/component.js";
import ComponentData from "game/components/componentData.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import Station from "game/items/station.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Block from "game/world/block.js";

/** A Block Component that allows the block to be opened as a station */
class StationComponent extends Component<BlockDefinition> {
    private openasset: string | null;

    constructor(openasset?: string){
        super();

        this.openasset = openasset || null;
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
        player.setImmediateAction(true);
    }

    /** Defines the tick of the block with this component */
    tick(block: Block, game: Game, dt: number): void {
        const data = block.getComponentData(StationComponentData);

        if(this.openasset === null) return;

        const shouldbeopen = data.station.checkOpeners(game) > 0;

        if(shouldbeopen && block.getCurrentAsset() != this.openasset) {
            block.setCurrentAsset(this.openasset);
        }else if(!shouldbeopen && block.getCurrentAsset() == this.openasset){
            block.clearCurrentAsset();
        }
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
