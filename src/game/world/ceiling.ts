import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of ceiling with its functionality and base statistics */
class Ceiling extends ComponentHandler<Ceiling> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;

    constructor(displayname: string, asset: string | null){
        super();
        this.displayname = displayname;
        if(asset != null) this.asset = asset;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    // #region serialization

    /** Return an object representing this ceilings data for loading to the game world */
    serializeForLoad(): any {
        return {
            asset: this.asset,
        };
    }

    /** Return an object representing this ceilings data for writing to the save */
    serializeForWrite(): any {
        return {
            name: this.name,
        };
    }

    // #endregion
}

export default Ceiling;