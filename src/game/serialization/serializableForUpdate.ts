/** The interface to define an object that serializes data to update */
interface SerializableForUpdate {
    /** Returns an object representing this object for a game update to the client */
    serializeForUpdate(): any;
}

export default SerializableForUpdate;