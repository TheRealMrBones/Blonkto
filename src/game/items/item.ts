import RegistryValue from '../registries/registryValue';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class Item extends RegistryValue {
    name: string = "unregistered";
    displayname: string;
    stacksize: number;
    asset: string = ASSETS.MISSING_TEXTURE;

    constructor(displayname: string, stacksize: number, asset: string | null){
        super();

        this.displayname = displayname;
        this.stacksize = stacksize;
        if(asset != null) this.asset = asset;
    }

    mapRegistryKey(key: string): void {
        this.name = key;
    }
}

export default Item;