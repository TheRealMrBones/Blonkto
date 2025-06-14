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
    asset: string;
    drops: DropBase | null;

    constructor(displayname: string, asset: string | null, drops?: DropBase){
        super();
        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
    }

    // #region registry helpers

    /** Sets this floors key in the floor registry */
    setRegistryKey(key: string): void {
        this.name = key;
    }

    /** Returns this floors registry key */
    getRegistryKey(): string {
        return this.name;
    }

    // #endregion

    // #region events

    /** Drops the item that this floor drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #endregion

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