import EventEmitter from "events";

import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import FloorDefinition from "../definitions/floorDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import FloorRegistry from "../registries/floorRegistry.js";
import { SerializedWriteFloor } from "../../shared/serializedWriteTypes.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

/** Represents a placed floor in the game world */
class Floor implements IRegistryDefinedWithComponents<FloorDefinition> {
    readonly cell: Cell;
    readonly definition: FloorDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();
    
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(cell: Cell, definition: string){
        this.cell = cell;
        this.definition = FloorRegistry.get(definition);

        this.initComponentData();
    }

    /** Returns the floor from its save data */
    static readFromSave(cell: Cell, data: any): Floor {
        const floor = new Floor(cell, data.floordefinition);
        floor.loadComponentData(data.componentdata);
        return floor;
    }

    // #region events

    /** Registers a listener to this floors event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a instantiate event listener to this floors event handler */
    registerInstantiateListener(listener: (game: Game) => void): void {
        this.registerListener("instantiate", listener);
    }

    /** Registers a unload event listener to this floors event handler */
    registerUnloadListener(listener: (game: Game) => void): void {
        this.registerListener("unload", listener);
    }

    /** Registers a tick event listener to this floors event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a break event listener to this floors event handler */
    registerBreakListener(listener: (game: Game) => void): void {
        this.registerListener("break", listener);
    }

    /** Registers a interact event listener to this floors event handler */
    registerInteractListener(listener: (game: Game, player: Player, info: ClickContentExpanded) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this floors event handler */
    private emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a instantiate event to this floors event handler */
    emitInstantiateEvent(game: Game): void {
        this.emitEvent("instantiate", game);
    }

    /** Emits a unload event to this floors event handler */
    emitUnloadEvent(game: Game): void {
        this.emitEvent("unload", game);
    }

    /** Emits a tick event to this floors event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    /** Emits a break event to this floors event handler */
    emitBreakEvent(game: Game): void {
        this.emitEvent("break", game);
    }

    /** Emits a interact event to this floors event handler */
    emitInteractEvent(game: Game, player: Player, info: ClickContentExpanded): void {
        this.emitEvent("interact", game, player, info);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this floors data for a game update to the client */
    serializeForUpdate(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
        };
    }

    /** Returns an object representing this floors data for writing to the save */
    serializeForWrite(): SerializedWriteFloor {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteFloor = {
            floordefinition: this.definition.getRegistryKey(),
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion

    // #region component helpers

    /** Returns this floors instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata.get(componentDataType.name) as T2;
    }

    /** Initializes this floors required component data instances */
    private initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata.set(c.componentdata.name, new c.componentdata(c.parent));
        });
    }

    /** Loads this floors required component data instances with the given data */
    private loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata.get(componentdataloaded[0]) as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns an object representing this floors component data for a game update to the client */
    private serializeComponentDataForUpdate(): any {
        let data: { [key: string]: any } = {};

        for(const componentdata of Object.values(this.componentdata)){
            const cd = componentdata as unknown as ISerializableForUpdate;
            if(cd.serializeForUpdate === undefined) continue;

            const serialized = cd.serializeForUpdate();
            if(serialized === null) continue;
            data = { ...data, ...serialized };
        }

        return data;
    }

    /** Returns an object representing this floors component data for writing to the save */
    private serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of Object.entries(this.componentdata)){
            const cd = componentdata[1] as unknown as ISerializableForWrite;
            if(cd.serializeForWrite === undefined) continue;

            const serialized = cd.serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion
}

export default Floor;