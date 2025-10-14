import RegistryValue from "./registryValue.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Manages a definition list specific type of class */
class Registry<T extends RegistryValue> {
    private readonly logger: Logger;

    readonly name: string;
    private readonly map: Map<string, T> = new Map<string, T>();

    constructor(name: string){
        this.logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);

        this.name = name;
    }

    // #region operations

    /** Adds the given value to the registry */
    register(value: T): void {
        if(this.has(value.key)){
            this.logger.error(`[${this.name}] Key "${value.key}" already registered!`);
            throw null;
        }

        this.map.set(value.key, value);
    }

    /** Returns if an object exists with the requested key */
    has(key: string): boolean {
        return this.map.has(key);
    }

    /** Returns the stored object for the requested key */
    get(key: string): T {
        const value = this.map.get(key);

        if(value === undefined){
            this.logger.error(`[${this.name}] Requested key "${key}" does not exist in this registry!`);
            throw null;
        }

        return value;
    }

    /** Returns all of the registered objects */
    getAll(): MapIterator<T> {
        return this.map.values();
    }

    // #endregion
}

export default Registry;
