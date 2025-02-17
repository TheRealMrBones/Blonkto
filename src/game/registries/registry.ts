import RegistryValue from "./registryValue.js";

class Registry<T extends RegistryValue> {
    private map: { [key: string]: T };

    constructor(){
        this.map = {};
    }

    register(key: string, value: T){
        if(key in this.map) throw new Error(`Key "${key}" already registered!`);
        this.map[key] = value;
        value.mapRegistryKey(key);
    }

    get(key: string): T{
        return this.map[key];
    }
}

export default Registry;