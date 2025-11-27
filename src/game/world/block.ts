import ComponentData from "game/components/componentData.js";
import IRegistryDefinedWithComponents from "game/components/IRegistryDefinedWithComponents.js";
import ISerializableForUpdate from "game/components/ISerializableForUpdate.js";
import ISerializableForWrite from "game/components/ISerializableForWrite.js";
import BlockDefinition from "game/definitions/blockDefinition.js";
import Game from "game/game.js";
import { ClickContentExpanded } from "game/managers/socketManager.js";
import Player from "game/objects/player.js";
import BlockRegistry from "game/registries/blockRegistry.js";
import Cell from "game/world/cell.js";
import { SerializedWriteBlock, SerializedUpdateBlock } from "shared/serialization/world/serializedBlock.js";

/** Represents a placed block in the game world */
class Block implements IRegistryDefinedWithComponents<BlockDefinition> {
    readonly cell: Cell;
    readonly definition: BlockDefinition;
    readonly componentdata: Map<string, ComponentData<any>> = new Map<string, ComponentData<any>>();

    private currentasset: string | null;

    constructor(cell: Cell, definition: string){
        this.cell = cell;
        this.definition = BlockRegistry.get(definition);

        this.initComponentData();

        this.currentasset = this.definition.asset;
    }

    /** Returns the block from its save data */
    static readFromSave(cell: Cell, data: SerializedWriteBlock): Block {
        const block = new Block(cell, data.blockdefinition);
        block.loadComponentData(data.componentdata);
        return block;
    }

    // #region getters

    /** Returns this blocks asset */
    getAsset(): string {
        return this.definition.asset;
    }

    /** Returns this blocks current asset */
    getCurrentAsset(): string {
        if(this.currentasset === null) return this.definition.asset;

        return this.currentasset;
    }

    // #endregion

    // #region setters

    /** Sets this blocks current asset */
    setCurrentAsset(asset: string): void {
        this.currentasset = asset;
        this.cell.onUpdate();
    }

    /** Sets this blocks current asset back to default */
    clearCurrentAsset(): void {
        this.currentasset = null;
        this.cell.onUpdate();
    }

    // #endregion

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
    serializeForUpdate(): SerializedUpdateBlock {
        const componentdata = this.serializeComponentDataForUpdate();

        const returnobj = {
            ...componentdata,
        };

        if(this.currentasset != this.getAsset()){
            returnobj.asset = this.getCurrentAsset();
        }

        if(this.currentasset === null) this.currentasset = this.getAsset();

        return returnobj;
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
    private loadComponentData(data?: { [key: string]: any }): void {
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
