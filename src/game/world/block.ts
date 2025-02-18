import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import ItemStack from "../items/itemStack.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES } = Constants;

/** The definition for a type of block with its functionality and base statistics */
class Block extends ComponentHandler<Block> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;
    drops: string;
    dropsamount: number = 1;
    scale: number = 1;
    shape: number = SHAPES.SQUARE;

    constructor(displayname: string, asset: string | null, drops: string, dropsamount?: number, scale?: number, shape?: number){
        super();
        this.displayname = displayname;
        if(asset != null) this.asset = asset;
        this.drops = drops;
        if(dropsamount !== undefined) this.dropsamount = dropsamount;
        if(scale !== undefined) this.scale = scale;
        if(shape !== undefined) this.shape = shape;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** Returns the item that this block drops on break */
    getDroppedStack(): ItemStack {
        return new ItemStack(this.drops, this.dropsamount);
    }

    // #region serialization

    /** Return an object representing this blocks data for loading to the game world */
    serializeForLoad(): any {
        return {
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
        };
    }

    /** Return an object representing this blocks data for writing to the save */
    serializeForWrite(): any {
        return {
            name: this.name,
        };
    }

    // #endregion
}

export default Block;