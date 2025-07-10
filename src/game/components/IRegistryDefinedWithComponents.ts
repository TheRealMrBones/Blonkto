import IRegistryDefined from "../registries/IRegistryDefined.js";
import IRegistryValue from "../registries/IRegistryValue.js";
import ComponentData from "./componentData.js";
import ComponentHandler from "./componentHandler.js";

/** The base interface for an object that is defined by a registry value that is a component handler */
interface IRegistryDefinedWithComponents<T extends ComponentHandler<T> & IRegistryValue> extends IRegistryDefined<T> {
    readonly componentdata: { [key: string]: ComponentData<any> };

    /** Initializes this objects required component data instances */
    initComponentData(): void;

    /** Loads this objects required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void;

    /** Returns this objects instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2;

    /** Returns an object representing this objects component data for a game update to the client */
    serializeComponentDataForUpdate(): any;

    /** Returns an object representing this objects component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any };
}

export default IRegistryDefinedWithComponents;