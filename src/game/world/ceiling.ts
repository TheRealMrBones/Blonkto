import EventEmitter from "events";

import ComponentData from "../components/componentData.js";
import RegistryDefinedWithComponents from "../components/registryDefinedWithComponents.js";
import CeilingDefinition from "../definitions/ceilingDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import { SerializedWriteCeiling } from "../../shared/serializedWriteTypes.js";

/** Represents a placed ceiling in the game world */
class Ceiling implements RegistryDefinedWithComponents<CeilingDefinition> {
    readonly cell: Cell;
    readonly definition: CeilingDefinition;
    readonly componentdata: { [key: string]: ComponentData } = {};
    
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
            this.componentdata[c.name] = new c();
        });
    }

    /** Loads this ceilings required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            this.componentdata[componentdataloaded[0]].readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this ceilings instance of the requested component data */
    getComponentData<T2 extends ComponentData>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Return an object representing this ceilings component data for a game update to the client */
    serializeComponentDataForUpdate(): any {
        const data = {
            static: {},
            dynamic: {},
        };

        for(const componentdata of Object.values(this.componentdata)){
            const serialized = componentdata.serializeForUpdate();
            if(serialized === null) continue;
            data.static = { ...data.static, ...serialized.static };
            data.dynamic = { ...data.dynamic, ...serialized.dynamic };
        }

        return data;
    }

    /** Return an object representing this ceilings component data for writing to the save */
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

    /** Registers a listener to this ceilings event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this ceilings event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Emits an event to this ceilings event handler */
    private emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a tick event to this ceilings event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this ceilings data for loading to the game world */
    serializeForLoad(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
            asset: this.definition.asset,
        };
    }

    /** Return an object representing this ceilings data for writing to the save */
    serializeForWrite(): SerializedWriteCeiling {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteCeiling = {
            ceilingdefinition: this.definition.name,
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion
}

export default Ceiling;