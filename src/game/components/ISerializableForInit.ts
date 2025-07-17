/** The interface to define an object that serializes data to init */
interface ISerializableForInit {
    /** Returns an object representing this object for saving to the client */
    serializeForInit(): any;
}

export default ISerializableForInit;
