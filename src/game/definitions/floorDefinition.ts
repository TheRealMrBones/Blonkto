import EventEmitter from "events";

import IRegistryValue from "../registries/IRegistryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import IDrop from "../items/IDrop.js";
import Game from "../game.js";
import Floor from "../world/floor.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of floor with its functionality and base statistics */
class FloorDefinition extends ComponentHandler<FloorDefinition> implements IRegistryValue {
    private name: string = "unregistered";
    readonly displayname: string;
    readonly asset: string;
    readonly drops: IDrop | null;
    
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, asset: string | null, drops?: IDrop){
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

    /** Registers a listener to this floor definitions event handler */
    private registerListener(event: string, listener: (self: Floor, game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a instantiate event listener to this floor definitions event handler */
    registerInstantiateListener(listener: (self: Floor, game: Game) => void): void {
        this.registerListener("instantiate", listener);
    }

    /** Registers an unload event listener to this floor definitions event handler */
    registerUnloadListener(listener: (self: Floor, game: Game) => void): void {
        this.registerListener("unload", listener);
    }

    /** Registers a tick event listener to this floor definitions event handler */
    registerTickListener(listener: (self: Floor, game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a break event listener to this floor definitions event handler */
    registerBreakListener(listener: (self: Floor, game: Game) => void): void {
        this.registerListener("break", listener);
    }

    /** Registers a interact event listener to this floor definitions event handler */
    registerInteractListener(listener: (self: Floor, game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this floor definitions event handler with the given self floor */
    emitEvent(event: string, self: Floor, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, self, game, ...args);
    }

    /** Returns if this floor definitions tick event has any listeners */
    ticks(): boolean {
        return (this.eventEmitter.listenerCount("tick") > 0);
    }

    // #endregion

    // #region events

    /** Drops the item that this floor drops on break */
    break(x: number, y: number, drop: boolean, game: Game): void {
        if(drop && this.drops != null) this.drops.drop(x + .5, y + .5, game);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this ceiling definition for saving to the client */
    serializeForInit(): any {
        const componentdata = this.serializeComponentsForInit();

        return {
            name: this.getRegistryKey(),
            asset: this.asset,
            ...componentdata,
        };
    }

    // #endregion
}

export default FloorDefinition;