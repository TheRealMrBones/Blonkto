/** The interface to define an object that serializes data to write */
interface ISerializableForWrite {
    /** Sets this objects values with the given save data */
    readFromSave(data: any): void;

    /** Returns an object representing this object for writing to the save */
    serializeForWrite(): any;
}

export default ISerializableForWrite;
