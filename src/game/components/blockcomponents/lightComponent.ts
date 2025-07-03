import Component from "../component.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import ComponentData from "../componentData.js";

/** A Block Component that allows the block to be opened as a light */
class LightComponent extends Component<BlockDefinition> {
    distance: number;

    constructor(distance: number){
        super();

        this.distance = distance;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: BlockDefinition): void {
        super.setParent(parent);
        this.getParent().addRequiredComponentData(LightComponentData);
    }
}

class LightComponentData implements ComponentData {
    /** Sets this light component data objects values with the given save data */
    readFromSave(data: any): void {
        
    }

    /** Returns an object representing this light component data for a game update to the client */
    serializeForUpdate(): any {
        return {
            light: true,
        };
    }

    /** Returns an object representing this light component data for writing to the save */
    serializeForWrite(): any {
        return null;
    }
}

export default LightComponent;