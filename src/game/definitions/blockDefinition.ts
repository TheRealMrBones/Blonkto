import EventEmitter from "events";

import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import IDrop from "../items/drops/IDrop.js";
import Block from "../world/block.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES, MINE_TYPES } = Constants;

/** The definition for a type of block with its functionality and base statistics */
class BlockDefinition extends ComponentHandler<BlockDefinition> {
    readonly displayname: string;
    readonly asset: string;
    readonly drops: IDrop | null;
    readonly minetype: number;
    readonly hardness: number;
    readonly scale: number;
    readonly shape: number;

    private walkthrough: boolean = false;
    private blockcell: boolean = true;
    private floorvisible: boolean = true;
    private underentities: boolean = false;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(key: string, displayname: string, asset: string | null, drops?: IDrop, minetype?: number, hardness?: number, scale?: number, shape?: number){
        super(key);
        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
        this.minetype = minetype || MINE_TYPES.NONE;
        this.hardness = hardness === undefined ? 1 : hardness;
        this.scale = scale === undefined ? 1 : scale;
        this.shape = shape === undefined ? SHAPES.SQUARE : shape;

        if(this.shape == SHAPES.SQUARE && this.scale == 1) this.floorvisible = false;
    }

    // #region builder functions

    /** Sets this blocks walk through property */
    setWalkThrough(walkthrough: boolean): BlockDefinition {
        this.walkthrough = walkthrough;
        return this;
    }

    /** Sets this blocks block cell property */
    setBlockCell(blockscell: boolean): BlockDefinition {
        this.blockcell = blockscell;
        return this;
    }

    /** Sets this blocks floor visible property */
    setFloorVisible(floorvisible: boolean): BlockDefinition {
        this.floorvisible = floorvisible;
        return this;
    }

    /** Sets this blocks under entities property */
    setUnderEntities(underentities: boolean): BlockDefinition {
        this.underentities = underentities;
        return this;
    }

    // #endregion

    // #region getters

    /** Returns this blocks walk through property */
    getWalkThrough(): boolean {
        return this.walkthrough;
    }

    /** Returns this blocks block cell property */
    getBlockCell(): boolean {
        return this.blockcell;
    }

    /** Returns this blocks floor visible property */
    getFloorVisible(): boolean {
        return this.floorvisible;
    }

    /** Returns this blocks underentities property */
    getUnderEntities(): boolean {
        return this.underentities;
    }

    // #endregion

    // #region events

    /** Registers a listener to this block definitions event handler */
    private registerListener(event: string, listener: (self: Block, game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a instantiate event listener to this block definitions event handler */
    registerInstantiateListener(listener: (self: Block, game: Game) => void): void {
        this.registerListener("instantiate", listener);
    }

    /** Registers an unload event listener to this block definitions event handler */
    registerUnloadListener(listener: (self: Block, game: Game) => void): void {
        this.registerListener("unload", listener);
    }

    /** Registers a tick event listener to this block definitions event handler */
    registerTickListener(listener: (self: Block, game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a break event listener to this block definitions event handler */
    registerBreakListener(listener: (self: Block, game: Game) => void): void {
        this.registerListener("break", listener);
    }

    /** Registers a interact event listener to this block definitions event handler */
    registerInteractListener(listener: (self: Block, game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this block definitions event handler with the given self block */
    emitEvent(event: string, self: Block, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, self, game, ...args);
    }

    /** Returns if this block definitions tick event has any listeners */
    ticks(): boolean {
        return (this.eventEmitter.listenerCount("tick") > 0);
    }

    /** Drops the item that this block drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this block definition for saving to the client */
    serializeForInit(): any {
        const componentdata = this.serializeComponentsForInit();

        return {
            name: this.key,
            asset: this.asset,
            scale: this.scale,
            shape: this.shape,
            floorvisible: this.getFloorVisible(),
            walkthrough: this.getWalkThrough(),
            underentities: this.getUnderEntities(),
            ...componentdata,
        };
    }

    // #endregion
}

export default BlockDefinition;
