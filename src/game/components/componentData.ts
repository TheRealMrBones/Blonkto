/** The base interface for a specific components object instance data structure */
interface ComponentData {
    /** Sets this component data objects values with the given save data */
    readFromSave(data: any): void;

    /** Returns an object representing this component data for a game update to the client */
    serializeForUpdate(): any;

    /** Returns an object representing this component data for writing to the save */
    serializeForWrite(): any;
}

export default ComponentData;