import Component from "game/components/component.js";
import FloorDefinition from "game/definitions/floorDefinition.js";

/** A Floor Component that allows the floor to grow plant blocks */
class OrganicComponent extends Component<FloorDefinition> {
    private growthrate: number;

    constructor(growthrate?: number){
        super();
        this.growthrate = growthrate || 1;
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: FloorDefinition): void {
        super.setParent(parent);
    }
}

export default OrganicComponent;
