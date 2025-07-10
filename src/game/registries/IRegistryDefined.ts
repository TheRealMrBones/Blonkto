import IRegistryValue from "./IRegistryValue.js";

/** The base interface for an object that is defined by a registry value */
interface IRegistryDefined<T extends IRegistryValue> {
    readonly definition: T;
}

export default IRegistryDefined;