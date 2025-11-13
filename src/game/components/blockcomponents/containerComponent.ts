import Component from "../component.js";
import Game from "../../game.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import StationComponent, { StationComponentData } from "./stationComponent.js";
import ComponentData from "../componentData.js";
import ISerializableForWrite from "../ISerializableForWrite.js";
import Inventory from "../../items/inventory/inventory.js";
import { SerializedWriteInventory } from "../../../shared/serialization/items/serializedInventory.js";

/** A Block Component that allows the block to be opened as a station */
class ContainerComponent extends Component<BlockDefinition> {
    readonly slotcount: number;

    constructor(slotcount: number){
        super();
        this.setRequirements([StationComponent]);

        this.slotcount = slotcount;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(ContainerComponentData, this);

        this.getParent().registerInstantiateListener((block: Block, game: Game) => this.instantiate(block, game));
        this.getParent().registerBreakListener((block: Block, game: Game, drop: boolean) => this.drop(block, game, drop));
    }

    /** Defines the instantiate of the block with this component */
    instantiate(block: Block, game: Game): void {
        const data = block.getComponentData(ContainerComponentData);
        const stationdata = block.getComponentData(StationComponentData);

        stationdata.station.inventories.push(data.inventory);
    }

    /** Defines the drop event of the block with this component */
    drop(block: Block, game: Game, drop: boolean){
        const data = block.getComponentData(ContainerComponentData);

        if(drop) data.inventory.dropInventory(block.cell.chunk.layer, block.cell.getWorldX() + .5, block.cell.getWorldY() + .5, game);
    }
}

class ContainerComponentData extends ComponentData<ContainerComponent> implements ISerializableForWrite {
    inventory: Inventory;

    constructor(parent: ContainerComponent){
        super(parent);

        this.inventory = new Inventory(parent.slotcount);
        this.inventory.resetChanges();
    }

    /** Sets this container component data objects values with the given save data */
    readFromSave(data: SerializedWriteContainerComponent): void {
        this.inventory = Inventory.readFromSave(data.inventory);
    }

    /** Returns an object representing this container component data for writing to the save */
    serializeForWrite(): SerializedWriteContainerComponent {
        return {
            inventory: this.inventory.serializeForWrite(),
        };
    }
}

/** Defines the format for serialized writes of a container component */
type SerializedWriteContainerComponent = {
    inventory: SerializedWriteInventory;
};

export default ContainerComponent;
