import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import DropBase from "../items/dropBase.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES } = Constants;

/** The definition for a type of block with its functionality and base statistics */
class Block extends ComponentHandler<Block> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string = ASSETS.MISSING_TEXTURE;
    drops: DropBase | null = null;
    minetype: number = MINE_TYPES.MINE;
    scale: number = 1;
    shape: number = SHAPES.SQUARE;
    blockscell: boolean = true;

    constructor(displayname: string, asset: string | null, drops?: DropBase, minetype?: number, scale?: number, shape?: number){
        super();
        this.displayname = displayname;
        if(asset != null) this.asset = asset;
        if(drops !== undefined) this.drops = drops;
        if(minetype !== undefined) this.minetype = minetype;
        if(scale !== undefined) this.scale = scale;
        if(shape !== undefined) this.shape = shape;
    }

    /** Sets this objects identifier to the given key from the registry */
    mapRegistryKey(key: string): void {
        this.name = key;
    }

    /** Drops the item that this block drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
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