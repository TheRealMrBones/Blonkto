/** The base interface for a type that can added to a registry */
interface IRegistryValue {
    /** Sets this registry values key in the registry */
    setRegistryKey(key: string): void;

    /** Returns this registry values registry key */
    getRegistryKey(): string;
}

export default IRegistryValue;