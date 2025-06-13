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
    walkthrough: boolean = false;
    blockscell: boolean = true;
    floorvisible: boolean = true;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, drops?: DropBase, minetype?: number, scale?: number, shape?: number){
        super();
        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
        this.minetype = minetype || MINE_TYPES.NONE;
        this.scale = scale || 1;
        this.shape = shape || SHAPES.SQUARE;

        if(this.shape == SHAPES.SQUARE && this.scale == 1) this.floorvisible = false;
    }

    // #region registry helpers

    /** Sets this blocks key in the block registry */
    setRegistryKey(key: string): void {
        this.name = key;
    }

    /** Returns this blocks registry key */
    getRegistryKey(): string {
        return this.name;
    }

    // #endregion

    // #region builder functions

    /** Sets this blocks walk through property */
    setWalkThrough(walkthrough: boolean): Block {
        this.walkthrough = walkthrough;
        return this;
    }

    /** Sets this blocks block cell property */
    setBlockCell(blockscell: boolean): Block {
        this.blockscell = blockscell;
        return this;
    }

    /** Sets this blocks floor visible property */
    setFloorVisible(floorvisible: boolean): Block {
        this.floorvisible = floorvisible;
        return this;
    }

    // #endregion

    // #region events

    /** Drops the item that this block drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this blocks data for loading to the game world */
    serializeForLoad(): any {
        return {
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
            floorvisible: this.floorvisible,
            walkthrough: this.walkthrough,
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