import RegistryDefined from "../registries/registryDefined.js";
import RegistryValue from "../registries/registryValue.js";
import ComponentData from "./componentData.js";
import ComponentHandler from "./componentHandler.js";

/** The base interface for an object that is defined by a registry value that is a component handler */
interface RegistryDefinedWithComponents<T extends ComponentHandler<T> & RegistryValue> extends RegistryDefined<T> {
    readonly componentdata: { [key: string]: ComponentData };

    /** Initializes this objects required component data instances */
    initComponentData(): void;

    /** Loads this objects required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void;

    /** Returns this objects instance of the requested component data */
    getComponentData<T2 extends ComponentData>(componentDataType: new (...args: any[]) => T2): T2;

    /** Return an object representing this objects component data for a game update to the client */
    serializeComponentDataForUpdate(): any;

    /** Return an object representing this objects component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any };
}

export default RegistryDefinedWithComponents;