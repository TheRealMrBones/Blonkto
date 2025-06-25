import EventEmitter from "events";

import ComponentData from "../components/componentData.js";
import RegistryDefinedWithComponents from "../components/registryDefinedWithComponents.js";
import BlockDefinition from "../definitions/blockDefinition.js";
import Cell from "./cell.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import BlockRegistry from "../registries/blockRegistry.js";
import { SerializedWriteBlock } from "../../shared/serializedWriteTypes.js";

/** Represents a placed block in the game world */
class Block implements RegistryDefinedWithComponents<BlockDefinition> {
    readonly cell: Cell;
    readonly definition: BlockDefinition;
    readonly componentdata: { [key: string]: ComponentData } = {};
    
    private eventEmitter: EventEmitter = new EventEmitter();

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

    // #region component helpers

    /** Initializes this blocks required component data instances */
    initComponentData(): void {
        this.definition.getRequiredComponentData().forEach(c => {
            this.componentdata[c.name] = new c();
        });
    }

    /** Loads this blocks required component data instances with the given data */
    loadComponentData(data: { [key: string]: any }): void {
        if(data === undefined) return;
        for(const componentdataloaded of Object.entries(data)){
            this.componentdata[componentdataloaded[0]].readFromSave(componentdataloaded[1]);
        }
    }

    /** Returns this blocks instance of the requested component data */
    getComponentData<T2 extends ComponentData>(componentDataType: new (...args: any[]) => T2): T2 {
        return this.componentdata[componentDataType.name] as T2;
    }

    /** Return an object representing this blocks component data for a game update to the client */
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

    /** Return an object representing this blocks component data for writing to the save */
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

    /** Registers a listener to this blocks event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this blocks event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a interact event listener to this blocks event handler */
    registerInteractListener(listener: (game: Game, player: Player, info: any) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this blocks event handler */
    private emitEvent(event: string, game: Game, ...args: any[]): void {
        this.definition.emitEvent(event, this, game, ...args);
        this.eventEmitter.emit(event, ...args);
    }

    /** Emits a tick event to this blocks event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    /** Emits a interact event to this blocks event handler */
    emitInteractEvent(game: Game, player: Player, info: any): void {
        this.emitEvent("interact", game, player, info);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this blocks data for loading to the game world */
    serializeForLoad(): any {
        const componentdata = this.serializeComponentDataForUpdate();

        return {
            ...componentdata,
            asset: this.definition.asset,
            scale: this.definition.scale,
            shape: this.definition.shape,
            floorvisible: this.definition.floorvisible,
            walkthrough: this.definition.walkthrough,
        };
    }

    /** Return an object representing this blocks data for writing to the save */
    serializeForWrite(): SerializedWriteBlock {
        const componentdata = this.serializeComponentDataForWrite();

        const returnobj: SerializedWriteBlock = {
            blockdefinition: this.definition.name,
        };
        if(Object.keys(componentdata).length > 0) returnobj.componentdata = componentdata;

        return returnobj;
    }

    // #endregion
}

export default Block;