import EventEmitter from "events";

import ComponentData from "../components/componentData.js";
import RegistryDefinedWithComponents from "../components/registryDefinedWithComponents.js";
import FloorDefinition from "../definitions/floorDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import FloorRegistry from "../registries/floorRegistry.js";
import { SerializedWriteFloor } from "../../shared/serializedWriteTypes.js";

/** Represents a placed floor in the game world */
class Floor implements RegistryDefinedWithComponents<FloorDefinition> {
    readonly cell: Cell;
    readonly definition: FloorDefinition;
    readonly componentdata: { [key: string]: ComponentData } = {};
    
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

    // #region component helpers

    /** Initializes this floors required component data instances */
    initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata[c.name] = new c();
        });
    }

    /** Loads this floors required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            this.componentdata[componentdataloaded[0]].readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this floors instance of the requested component data */
    getComponentData<T2 extends ComponentData>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Return an object representing this floors component data for a game update to the client */
    serializeComponentDataForUpdate(): any {
        let data: { [key: string]: any } = {};

        for(const componentdata of Object.values(this.componentdata)){
            const serialized = componentdata.serializeForUpdate();
            if(serialized === null) continue;
            data = { ...data, ...serialized };
        }

        return data;
    }

    /** Return an object representing this floors component data for writing to the save */
    serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of Object.entries(this.componentdata)){
            const serialized = componentdata[1].serializeForWrite();
            if(serialized === null) continue;
            data[componentdata[0]] = serialized;
        }

        return data;
    }

    // #endregion

    // #region events

    /** Registers a listener to this floors event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this floors event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Emits an event to this floors event handler */
    private emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a tick event to this floors event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this floors data for loading to the game world */
    serializeForLoad(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
            name: this.definition.getRegistryKey(),
            asset: this.definition.asset,
        };
    }

    /** Return an object representing this floors data for writing to the save */
    serializeForWrite(): SerializedWriteFloor {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteFloor = {
            floordefinition: this.definition.getRegistryKey(),
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion
}

export default Floor;