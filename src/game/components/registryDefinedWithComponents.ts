import RegistryDefined from "../registries/registryDefined.js";
import RegistryValue from "../registries/registryValue";
import ComponentData from "./componentData";
import ComponentHandler from "./componentHandler.js";

/** The base interface for an object that is defined by a registry value that is a component handler */
interface RegistryDefinedWithComponents<T extends ComponentHandler<T> & RegistryValue> extends RegistryDefined<T> {
    readonly componentdata: ComponentData[];
}

export default RegistryDefinedWithComponents;