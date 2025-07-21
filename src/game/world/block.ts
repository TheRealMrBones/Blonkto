import ComponentData from "../components/componentData.js";
import IRegistryDefinedWithComponents from "../components/IRegistryDefinedWithComponents.js";
import BlockDefinition from "../definitions/blockDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import BlockRegistry from "../registries/blockRegistry.js";
import { SerializedWriteBlock } from "../../shared/serializedWriteTypes.js";
import { ClickContentExpanded } from "../managers/socketManager.js";
import ISerializableForWrite from "../components/ISerializableForWrite.js";
import ISerializableForUpdate from "../components/ISerializableForUpdate.js";

/** Represents a placed block in the game world */
class Block implements IRegistryDefinedWithComponents<BlockDefinition> {
    readonly cell: Cell;
    readonly definition: BlockDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();

    constructor(cell: Cell, definition: string){
        this.cell = cell;
        this.definition = BlockRegistry.get(definition);

        this.initComponentData();
    }

    /** Returns the block from its save data */
    static readFromSave(cell: Cell, data: any): Block {
        const block = new Block(cell, data.blockdefinition);
        block.loadComponentData(data.componentdata);
        return block;
    }

    // #region events

    /** Emits a instantiate event to this block */
    emitInstantiateEvent(game: Game): void {
        this.definition.emitEvent("instantiate", this, game);
    }

    /** Emits a unload event to this block */
    emitUnloadEvent(game: Game): void {
        this.definition.emitEvent("unload", this, game);
    }

    /** Emits a tick event to this block */
    emitTickEvent(game: Game, dt: number): void {
        this.definition.emitEvent("tick", this, game, dt);
    }

    /** Emits a break event to this block */
    emitBreakEvent(game: Game, drop: boolean): void {
        this.definition.emitEvent("break", this, game, drop);

        // actually drop items
        if(drop && this.definition.drops !== null){
            const dropx = this.cell.getWorldX() + .5;
            const dropy = this.cell.getWorldY() + .5;
            this.definition.drops.drop(this.cell.chunk.layer, dropx, dropy, game);
        }
    }

    /** Emits a interact event to this block */
    emitInteractEvent(game: Game, player: Player, info: ClickContentExpanded): void {
        this.definition.emitEvent("interact", this, game, player, info);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this blocks data for a game update to the client */
    serializeForUpdate(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
        };
    }

    /** Returns an object representing this blocks data for writing to the save */
    serializeForWrite(): SerializedWriteBlock {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteBlock = {
            blockdefinition: this.definition.key,
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion

    // #region component helpers

    /** Returns this blocks instance of the requested component data */
    getComponentData<T2 extends ComponentData<any>>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata.get(componentDataType.name) as T2;
    }

    /** Initializes this blocks required component data instances */
    private initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata.set(c.componentdata.name, new c.componentdata(c.parent));
        });
    }

    /** Loads this blocks required component data instances with the given data */
    private loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            const cd = this.componentdata.get(componentdataloaded[0]) as unknown as ISerializableForWrite;
            if(cd.readFromSave !== undefined)
                cd.readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns an object representing this blocks component data for a game update to the client */
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

    /** Returns an object representing this blocks component data for writing to the save */
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

export default Block;
