import EventEmitter from "events";

import RegistryValue from "../registries/registryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import DropBase from "../items/dropBase.js";
import Block from "../world/block.js";
import Player from "../objects/player.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES } = Constants;

/** The definition for a type of block with its functionality and base statistics */
class BlockDefinition extends ComponentHandler<BlockDefinition> implements RegistryValue {
    name: string = "unregistered";
    displayname: string;
    asset: string;
    drops: DropBase | null;
    minetype: number;
    hardness: number;
    scale: number;
    shape: number;
    walkthrough: boolean = false;
    blockscell: boolean = true;
    floorvisible: boolean = true;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, drops?: DropBase, minetype?: number, hardness?: number, scale?: number, shape?: number){
        super();
        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
        this.minetype = minetype || MINE_TYPES.NONE;
        this.hardness = hardness || 1;
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
    setWalkThrough(walkthrough: boolean): BlockDefinition {
        this.walkthrough = walkthrough;
        return this;
    }

    /** Sets this blocks block cell property */
    setBlockCell(blockscell: boolean): BlockDefinition {
        this.blockscell = blockscell;
        return this;
    }

    /** Sets this blocks floor visible property */
    setFloorVisible(floorvisible: boolean): BlockDefinition {
        this.floorvisible = floorvisible;
        return this;
    }

    // #endregion

    // #region events

    /** Registers a listener to this block definitions event handler */
    private registerListener(event: string, listener: (self: Block, game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this block definitions event handler */
    registerTickListener(listener: (self: Block, game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a interact event listener to this block definitions event handler */
    registerInteractListener(listener: (self: Block, game: Game, player: Player, info: any) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this block definitions event handler with the given self block */
    emitEvent(event: string, self: Block, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, self, game, ...args);
    }

    // #endregion

    // #region events

    /** Drops the item that this block drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #endregion
}

export default BlockDefinition;