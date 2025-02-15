import RegistryValue from "../registries/registryValue";
import ComponentHandler from "../components/componentHandler";

import Constants from "../../shared/constants";
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