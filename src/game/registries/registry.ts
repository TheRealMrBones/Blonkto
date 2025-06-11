import RegistryValue from "./registryValue.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** Manages a definition list specific type of class */
class Registry<T extends RegistryValue> {
    private logger: Logger;
    
    private map: { [key: string]: T };

    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.REGISTRY);

        this.map = {};
    }

    // #region operations

    /** Adds the given value to the registry */
    register(key: string, value: T): void {
        if(key in this.map){
            this.logger.error(`Key "${key}" already registered!`);
            throw null;
        }
        
        this.map[key] = value;
        value.mapRegistryKey(key);
    }

    /** Returns if an object exists with the requested key */
    has(key: string): boolean {
        return (this.map[key] !== undefined);
    }

    /** Returns the stored object for the requested key */
    get(key: string): T {
        return this.map[key];
    }

    /** Returns all of the registered objects */
    getAll(): T[] {
        return Object.values(this.map);
    }

    // #endregion
}

export default Registry;