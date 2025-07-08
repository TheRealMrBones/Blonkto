import EventEmitter from "events";

import ComponentData from "../components/componentData.js";
import RegistryDefinedWithComponents from "../components/registryDefinedWithComponents.js";
import CeilingDefinition from "../definitions/ceilingDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import { SerializedWriteCeiling } from "../../shared/serializedWriteTypes.js";
import SerializableForWrite from "../components/serializableForWrite.js";
import SerializableForUpdate from "../components/serializableForUpdate.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

/** Represents a placed ceiling in the game world */
class Ceiling implements RegistryDefinedWithComponents<CeilingDefinition> {
    readonly cell: Cell;
    readonly definition: CeilingDefinition;
    readonly componentdata: { [key: string]: ComponentData<any> } = {};
    
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(cell: Cell, definition: string){
        this.cell = cell;
        this.definition = CeilingRegistry.get(definition);

        this.initComponentData();
    }

    /** Returns the ceiling from its save data */
    static readFromSave(cell: Cell, data: any): Ceiling {
        const ceiling = new Ceiling(cell, data.ceilingdefinition);
        ceiling.loadComponentData(data.componentdata);
        return ceiling;
    }

    // #region component helpers

    /** Initializes this ceilings required component data instances */
    initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata[c.componentdata.name] = new c.componentdata(c.parent);
        });
    }

    /** Loads this ceilings required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata[componentdataloaded[0]] as unknown as SerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this ceilings instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Returns an object representing this ceilings component data for a game update to the client */
    serializeComponentDataForUpdate(): any {
        let data: { [key: string]: any } = {};

        for(const componentdata of Object.values(this.componentdata)){
            const cd = componentdata as unknown as SerializableForUpdate;
            if(cd.serializeForUpdate === undefined) continue;

            const serialized = cd.serializeForUpdate();
            if(serialized === null) continue;
            data = { ...data, ...serialized };
        }

        return data;
    }

    /** Returns an object representing this ceilings component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of Object.entries(this.componentdata)){
            const cd = componentdata[1] as unknown as SerializableForWrite;
            if(cd.serializeForWrite === undefined) continue;

            const serialized = cd.serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion

    // #region events

    /** Registers a listener to this ceilings event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a instantiate event listener to this ceilings event handler */
    registerInstantiateListener(listener: (game: Game) => void): void {
        this.registerListener("instantiate", listener);
    }

    /** Registers a unload event listener to this ceilings event handler */
    registerUnloadListener(listener: (game: Game) => void): void {
        this.registerListener("unload", listener);
    }

    /** Registers a tick event listener to this ceilings event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a break event listener to this ceilings event handler */
    registerBreakListener(listener: (game: Game) => void): void {
        this.registerListener("break", listener);
    }

    /** Registers a interact event listener to this ceilings event handler */
    registerInteractListener(listener: (game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this ceilings event handler */
    private emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a instantiate event to this ceilings event handler */
    emitInstantiateEvent(game: Game): void {
        this.emitEvent("instantiate", game);
    }

    /** Emits a unload event to this ceilings event handler */
    emitUnloadEvent(game: Game): void {
        this.emitEvent("unload", game);
    }

    /** Emits a tick event to this ceilings event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    /** Emits a break event to this ceilings event handler */
    emitBreakEvent(game: Game): void {
        this.emitEvent("break", game);
    }

    /** Emits a interact event to this ceilings event handler */
    emitInteractEvent(game: Game, player: Player, info: ClickContentExpanded): void {
        this.emitEvent("interact", game, player, info);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this ceilings data for a game update to the client */
    serializeForUpdate(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
        };
    }

    /** Returns an object representing this ceilings data for writing to the save */
    serializeForWrite(): SerializedWriteCeiling {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteCeiling = {
            ceilingdefinition: this.definition.getRegistryKey(),
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion
}

export default Ceiling;