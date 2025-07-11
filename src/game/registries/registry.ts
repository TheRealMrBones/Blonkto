import IRegistryValue from "./IRegistryValue.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Manages a definition list specific type of class */
class Registry<T extends IRegistryValue> {
    private readonly logger: Logger;
    
    name: string;
    private map: { [key: string]: T };

    constructor(name: string){
        this.logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);

        this.name = name;
        this.map = {};
    }

    // #region operations

    /** Adds the given value to the registry */
    register(key: string, value: T): void {
        if(key in this.map){
            this.logger.error(`[${this.name}] Key "${key}" already registered!`);
            throw null;
        }else if(value.getRegistryKey() !== "unregistered"){
            this.logger.error(`[${this.name}] Registry value already registered under the name: "${value.getRegistryKey()}"!`);
            throw null;
        }
        
        this.map[key] = value;
        value.setRegistryKey(key);
    }

    /** Returns if an object exists with the requested key */
    has(key: string): boolean {
        return (this.map[key] !== undefined);
    }

    /** Returns the stored object for the requested key */
    get(key: string): T {
        if(!this.has(key)){
            this.logger.error(`[${this.name}] Requested Key "${key}" does not exist in this registry!`);
            throw null;
        }

        return this.map[key];
    }

    /** Returns all of the registered objects */
    getAll(): T[] {
        return Object.values(this.map);
    }

    // #endregion
}

export default Registry;