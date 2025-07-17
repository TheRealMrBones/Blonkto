/** The base class for an object that can added to a registry */
abstract class RegistryValue {
    readonly key: string;

    constructor(key: string){
        this.key = key;
    }
}

export default RegistryValue;
