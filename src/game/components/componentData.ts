/** The base interface for a specific components object instance data structure */
interface ComponentData {
    /** Returns the component data object from the given save data */
    readFromSave(data: any): this;

    /** Returns an object representing this component data for a game update to the client */
    serializeForUpdate(): any;

    /** Returns an object representing this component data for writing to the save */
    serializeForWrite(): any;
}

export default ComponentData;