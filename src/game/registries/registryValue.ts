/** The base interface for a type that can added to a registry */
interface RegistryValue {
    /** Returns this blocks key in the registry */
    mapRegistryKey(key: string): void;
}

export default RegistryValue;