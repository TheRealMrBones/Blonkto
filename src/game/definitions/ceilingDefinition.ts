import EventEmitter from "events";

import ComponentHandler from "game/components/componentHandler.js";
import Game from "game/game.js";
import IDrop from "game/items/drops/IDrop.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import Ceiling from "game/world/ceiling.js";
import Constants from "shared/constants.js";
import { SerializedInitCeiling } from "shared/serialization/world/serializedCeiling.js";

const { ASSETS } = Constants;

/** The definition for a type of ceiling with its functionality and base statistics */
class CeilingDefinition extends ComponentHandler<CeilingDefinition> {
    readonly displayname: string;
    readonly asset: string;
    readonly drops: IDrop | null;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(key: string, displayname: string, asset: string | null, drops?: IDrop){
        super(key);

        this.displayname = displayname;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
        this.drops = drops || null;
    }

    // #region events

    /** Registers a listener to this ceiling definitions event handler */
    private registerListener(event: string, listener: (self: Ceiling, game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a instantiate event listener to this ceiling definitions event handler */
    registerInstantiateListener(listener: (self: Ceiling, game: Game) => void): void {
        this.registerListener("instantiate", listener);
    }

    /** Registers an unload event listener to this ceiling definitions event handler */
    registerUnloadListener(listener: (self: Ceiling, game: Game) => void): void {
        this.registerListener("unload", listener);
    }

    /** Registers a tick event listener to this ceiling definitions event handler */
    registerTickListener(listener: (self: Ceiling, game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a break event listener to this ceiling definitions event handler */
    registerBreakListener(listener: (self: Ceiling, game: Game, drop: boolean) => void): void {
        this.registerListener("break", listener);
    }

    /** Registers a interact event listener to this ceiling definitions event handler */
    registerInteractListener(listener: (self: Ceiling, game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this ceiling definitions event handler with the given self ceiling */
    emitEvent(event: string, self: Ceiling, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, self, game, ...args);
    }

    /** Returns if this ceiling definitions tick event has any listeners */
    ticks(): boolean {
        return (this.eventEmitter.listenerCount("tick") > 0);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this ceiling definition for saving to the client */
    serializeForInit(): SerializedInitCeiling {
        const componentdata = this.serializeComponentsForInit();

        return {
            name: this.key,
            asset: this.asset,
            ...componentdata,
        };
    }

    // #endregion
}

export default CeilingDefinition;
