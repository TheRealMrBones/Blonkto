import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

class Ceiling implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;

    componentHandler: ComponentHandler<Ceiling>;

    constructor(displayname: string, asset: string | null){
        this.displayname = displayname;
        if(asset != null) this.asset = asset;

        this.componentHandler = new ComponentHandler<Ceiling>(this);
    }

    mapRegistryKey(key: string): void {
        this.name = key;
    }

    // #region serialization

    serializeForLoad(){
        return {
            asset: this.asset,
        };
    }

    serializeForWrite(){
        return {
            name: this.name,
        };
    }

    // #endregion
}

export default Ceiling;