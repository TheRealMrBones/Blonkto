import Component from "game/components/component.js";

/** The base class for a specific components object instance data structure */
abstract class ComponentData<T extends Component<any>> {
    readonly parent: T;

    constructor(parent: T){
        this.parent = parent;
    }
}

export default ComponentData;
