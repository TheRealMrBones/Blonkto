import EventEmitter from "events";

import IRegistryValue from "../registries/IRegistryValue.js";
import ComponentHandler from "../components/componentHandler.js";
import Game from "../game.js";
import ItemStack from "../items/itemStack.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

/** The definition for a type of item with its functionality and base statistics */
class ItemDefinition extends ComponentHandler<ItemDefinition> implements IRegistryValue {
    private name: string = "unregistered";
    private readonly displayname: string;
    private readonly stacksize: number;
    private readonly asset: string;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(displayname: string, stacksize: number, asset: string | null){
        super();
        this.displayname = displayname;
        this.stacksize = stacksize;
        this.asset = asset || ASSETS.MISSING_TEXTURE;
    }

    // #region registry helpers

    /** Sets this items key in the item registry */
    setRegistryKey(key: string): void {
        this.name = key;
    }

    /** Returns this items registry key */
    getRegistryKey(): string {
        return this.name;
    }

    // #endregion

    // #region getters

    /** Returns this items display name */
    getDisplayName(): string {
        return this.displayname;
    }

    /** Returns this items stack size */
    getStackSize(): number {
        return this.stacksize;
    }

    /** Returns this items asset */
    getAsset(): string {
        return this.asset;
    }

    // #endregion

    // #region events

    /** Registers a listener to this objects event handler */
    private registerListener(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a use event listener to this objects event handler */
    registerUseListener(listener: (stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("use", listener);
    }

    /** Registers an interact event listener to this objects event handler */
    registerInteractListener(listener: (stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this objects event handler */
    protected emitEvent(event: string, ...args: any[]): void {
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a use event to this objects event handler and returns if default action */
    emitUseEvent(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): boolean {
        this.emitEvent("use", stack, game, player, info);
        return (this.eventEmitter.listenerCount("use") == 0);
    }

    /** Emits a interact event to this objects event handler and returns if default action */
    emitInteractEvent(stack: ItemStack, game: Game, player: Player, info: ClickContentExpanded): boolean {
        this.emitEvent("interact", stack, game, player, info);
        return (this.eventEmitter.listenerCount("interact") == 0);
    }

    // #endregion
}

export default ItemDefinition;
