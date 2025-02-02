import RegistryValue from '../registries/registryValue';
import ComponentHandler from '../components/componentHandler';

import Constants from '../../shared/constants';
const { ASSETS } = Constants;

class Item implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    stacksize: number;
    asset: string = ASSETS.MISSING_TEXTURE;

    componentHandler: ComponentHandler<Item>;

    constructor(displayname: string, stacksize: number, asset: string | null){
        this.displayname = displayname;
        this.stacksize = stacksize;
        if(asset != null) this.asset = asset;

        this.componentHandler = new ComponentHandler<Item>(this);
    }

    mapRegistryKey(key: string): void {
        this.name = key;
    }
}

export default Item;