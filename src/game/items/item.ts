import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";

import Constants from "../../shared/constants.js";
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