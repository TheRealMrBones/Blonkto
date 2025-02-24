import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import DropBase from "../items/dropBase.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of floor with its functionality and base statistics */
class Floor extends ComponentHandler<Floor> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;
    drops: DropBase | null = null;

    constructor(displayname: string, asset: string | null, drops?: DropBase){
        super();
        this.displayname = displayname;
        if(asset != null) this.asset = asset;
        if(drops !== undefined) this.drops = drops;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** Drops the item that this floor drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #region serialization

    /** Return an object representing this floors data for loading to the game world */
    serializeForLoad(): any {
        return {
            asset: this.asset,
        };
    }

    /** Return an object representing this floors data for writing to the save */
    serializeForWrite(): any {
        return {
            name: this.name,
        };
    }

    // #endregion
}

export default Floor;