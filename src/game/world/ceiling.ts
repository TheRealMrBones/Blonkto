import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import CeilingDefinition from "../definitions/ceilingDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import { SerializedWriteCeiling } from "../../shared/serializedWriteTypes.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";
import Player from "../objects/player.js";
import { ClickContentExpanded } from "../managers/socketManager.js";

/** Represents a placed ceiling in the game world */
class Ceiling implements IRegistryDefinedWithComponents<CeilingDefinition> {
    readonly cell: Cell;
    readonly definition: CeilingDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();

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

    // #region events

    /** Emits a instantiate event to this ceiling */
    emitInstantiateEvent(game: Game): void {
        this.definition.emitEvent("instantiate", this, game);
    }

    /** Emits a unload event to this ceiling */
    emitUnloadEvent(game: Game): void {
        this.definition.emitEvent("unload", this, game);
    }

    /** Emits a tick event to this ceiling */
    emitTickEvent(game: Game, dt: number): void {
        this.definition.emitEvent("tick", this, game, dt);
    }

    /** Emits a break event to this ceiling */
    emitBreakEvent(game: Game, drop: boolean): void {
        this.definition.emitEvent("break", this, game, drop);

        // actually drop items
        if(drop && this.definition.drops !== null){
            const dropx = this.cell.getWorldX() + .5;
            const dropy = this.cell.getWorldY() + .5;
            this.definition.drops.drop(this.cell.chunk.layer, dropx, dropy, game);
        }
    }

    /** Emits a interact event to this ceiling */
    emitInteractEvent(game: Game, player: Player, info: ClickContentExpanded): void {
        this.definition.emitEvent("interact", this, game, player, info);
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
            ceilingdefinition: this.definition.key,
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion

    // #region component helpers

    /** Returns this ceilings instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata.get(componentDataType.name) as T2;
    }

    /** Initializes this ceilings required component data instances */
    private initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata.set(c.componentdata.name, new c.componentdata(c.parent));
        });
    }

    /** Loads this ceilings required component data instances with the given data */
    private loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata.get(componentdataloaded[0]) as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns an object representing this ceilings component data for a game update to the client */
    private serializeComponentDataForUpdate(): any {
        let data: { [key: string]: any } = {};

        for(const componentdata of this.componentdata.values()){
            const cd = componentdata as unknown as ISerializableForUpdate;
            if(cd.serializeForUpdate === undefined) continue;

            const serialized = cd.serializeForUpdate();
            if(serialized === null) continue;
            data = { ...data, ...serialized };
        }

        return data;
    }

    /** Returns an object representing this ceilings component data for writing to the save */
    private serializeComponentDataForWrite(): { [key: string]: any } {
        const data: { [key: string]: any } = {};

        for(const componentdata of this.componentdata.entries()){
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

export default Ceiling;
