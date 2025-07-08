/** The interface to define an object that serializes data to init */
interface SerializableForInit {
    /** Returns an object representing this object for saving to the client */
    serializeForInit(): any;
}

export default SerializableForInit;