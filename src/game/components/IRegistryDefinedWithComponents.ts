import IRegistryDefined from "../registries/IRegistryDefined.js";
import IRegistryValue from "../registries/IRegistryValue.js";
import ComponentData from "./componentData.js";
import ComponentHandler from "./componentHandler.js";

/** The base interface for an object that is defined by a registry value that is a component handler */
interface IRegistryDefinedWithComponents<T extends ComponentHandler<T> & IRegistryValue> extends IRegistryDefined<T> {
    readonly componentdata: Map<string, ComponentData<any>>;

    /** Returns this objects instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2;
}

export default IRegistryDefinedWithComponents;