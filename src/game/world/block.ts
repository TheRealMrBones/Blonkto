import EventEmitter from "events";

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
    asset: string;
    drops: DropBase | null;
    minetype: number;
    scale: number;
    shape: number;
    blockscell: boolean = true;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, drops?: DropBase, minetype?: number, scale?: number, shape?: number){
        super();
        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
        this.minetype = minetype || MINE_TYPES.MINE;
        this.scale = scale || 1;
        this.shape = shape || SHAPES.SQUARE;
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