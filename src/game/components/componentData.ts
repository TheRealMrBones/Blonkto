import Component from "./component.js";

/** The base class for a specific components object instance data structure */
abstract class ComponentData<T extends Component<any>> {
    readonly parent: T;

    constructor(parent: T){
        this.parent = parent;
    }

    /** Sets this component data objects values with the given save data */
    abstract readFromSave(data: any): void;

    /** Returns an object representing this component data for a game update to the client */
    abstract serializeForUpdate(): any;

    /** Returns an object representing this component data for writing to the save */
    abstract serializeForWrite(): any;
}

export default ComponentData;