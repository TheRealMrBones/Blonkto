import Component from "../component.js";
import Game from "../../game.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import Block from "../../world/block.js";
import StationComponent, { StationComponentData } from "./stationComponent.js";
import ComponentData from "../componentData.js";
import ISerializableForWrite from "../ISerializableForWrite.js";
import Inventory from "../../items/inventory/inventory.js";

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
    }

    /** Defines the instantiate of the block with this component */
    instantiate(block: Block, game: Game): void {
        const data = block.getComponentData(ContainerComponentData);
        const stationdata = block.getComponentData(StationComponentData);

        stationdata.station.inventories.push(data.inventory);
    }
}

class ContainerComponentData extends ComponentData<ContainerComponent> implements ISerializableForWrite {
    inventory: Inventory;

    constructor(parent: ContainerComponent){
        super(parent);

        this.inventory = new Inventory(parent.slotcount, true);
        this.inventory.resetChanges();
    }

    /** Sets this container component data objects values with the given save data */
    readFromSave(data: any): void {
        this.inventory = Inventory.readFromSave(data.inventory, true);
    }

    /** Returns an object representing this container component data for writing to the save */
    serializeForWrite(): any {
        return {
            inventory: this.inventory.serializeForWrite(),
        };
    }
}

export default ContainerComponent;