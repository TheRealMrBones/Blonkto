import Component from "../component.js";
import BlockDefinition from "../../definitions/blockDefinition.js";
import ComponentData from "../componentData.js";
import SerializableForUpdate from "../../serialization/serializableForUpdate.js";

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
        this.getParent().addRequiredComponentData(LightComponentData, this);
    }
}

class LightComponentData extends ComponentData<LightComponent> implements SerializableForUpdate {
    /** Returns an object representing this light component data for a game update to the client */
    serializeForUpdate(): any {
        return {
            light: this.parent.distance,
        };
    }
}

export default LightComponent;