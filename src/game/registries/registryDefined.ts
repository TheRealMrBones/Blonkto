import RegistryValue from "./registryValue.js";

/** The base interface for an object that is defined by a registry value */
interface RegistryDefined<T extends RegistryValue> {
    readonly definition: T;
}

export default RegistryDefined;