import RegistryValue from "./registryValue.js";

/** Manages a definition list specific type of class */
class Registry<T extends RegistryValue> {
    private map: { [key: string]: T };

    constructor(){
        this.map = {};
    }

    /** Adds the given value to the registry */
    register(key: string, value: T): void {
        if(key in this.map) throw new Error(`Key "${key}" already registered!`);
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
}

export default Registry;