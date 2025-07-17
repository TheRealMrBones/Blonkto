import IRegistryValue from "./IRegistryValue.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Manages a definition list specific type of class */
class Registry<T extends IRegistryValue> {
    private readonly logger: Logger;
    
    readonly name: string;
    private readonly map: Map<string, T> = new Map<string, T>();

    constructor(name: string){
        this.logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);

        this.name = name;
    }

    // #region operations

    /** Adds the given value to the registry */
    register(key: string, value: T): void {
        if(this.has(key)){
            this.logger.error(`[${this.name}] Key "${key}" already registered!`);
            throw null;
        }else if(value.getRegistryKey() !== "unregistered"){
            this.logger.error(`[${this.name}] Registry value already registered under the name: "${value.getRegistryKey()}"!`);
            throw null;
        }
        
        this.map.set(key, value);
        value.setRegistryKey(key);
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
