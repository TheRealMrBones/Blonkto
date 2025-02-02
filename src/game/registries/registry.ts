import RegistryValue from './registryValue';

class Registry<T extends RegistryValue> {
    private map: { [key: string]: T };

    constructor(){
        this.map = {};
    }

    Register(key: string, value: T){
        if(key in this.map){
            throw new Error(`Key "${key}" already registered!`);
        }

        this.map[key] = value;
        value.mapRegistryKey(key);
    }

    Get(key: string): T{
        return this.map[key];
    }
}

export default Registry;