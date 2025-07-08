import FloorRegistry from "../registries/floorRegistry.js";
import FloorDefinition from "../definitions/floorDefinition.js";
import Block from "./block.js";
import Floor from "./floor.js";
import Ceiling from "./ceiling.js";
import Game from "../game.js";
import Chunk from "./chunk.js";

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** Represents a single cell in the game world and its block, floor, and ceiling */
class Cell {
    readonly chunk: Chunk;
    readonly chunkx: number;
    readonly chunky: number;
    
    basefloor: FloorDefinition | null;
    block: Block | null = null;
    floor: Floor | null = null;
    ceiling: Ceiling | null = null;

    ticks: boolean = false;

    constructor(chunk: Chunk, chunkx: number, chunky: number, basefloor: string | null){
        this.chunk = chunk;
        this.chunkx = chunkx;
        this.chunky = chunky;
        
        this.basefloor = basefloor ? FloorRegistry.get(basefloor) : null;
        this.floor = this.basefloor ? new Floor(this, this.basefloor.getRegistryKey()) : null;
    }

    /** Returns the chunk from its save data */
    static readFromSave(chunk: Chunk, chunkx: number, chunky: number, data: any, game: Game): Cell {
        const cell = new Cell(chunk, chunkx, chunky, data.basefloor ? data.basefloor : null);

        if(data.block) cell.block = Block.readFromSave(cell, data.block);
        if(data.floor) cell.floor = Floor.readFromSave(cell, data.floor);
        if(data.ceiling) cell.ceiling = Ceiling.readFromSave(cell, data.ceiling);
        if(cell.block !== null) cell.block.emitInstantiateEvent(game);
        if(cell.floor !== null) cell.floor.emitInstantiateEvent(game);
        if(cell.ceiling !== null) cell.ceiling.emitInstantiateEvent(game);

        cell.setTicks();

        return cell;
    }

    // #region setters

    /** Sets the ticks boolean based on if any of the parts of this cell listen to ticks */
    setTicks(): void {
        this.ticks = false;
        if(this.block !== null) if(this.block.definition.ticks()) this.ticks = true;
        if(this.floor !== null) if(this.floor.definition.ticks()) this.ticks = true;
        if(this.ceiling !== null) if(this.ceiling.definition.ticks()) this.ticks = true;
    }

    /** Sets the block for this cell */
    setBlock(block: string | null, game: Game): void {
        this.block = (block === null) ? null : new Block(this, block);
        if(this.block !== null) this.block.emitInstantiateEvent(game);

        this.setTicks();
    }

    /** Sets the floor for this cell */
    setFloor(floor: string | null, game: Game): void {
        this.floor = (floor === null) ? (this.basefloor ? new Floor(this, this.basefloor.getRegistryKey()) : null) : new Floor(this, floor);
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.setTicks();
    }

    /** Sets the ceiling for this cell */
    setCeiling(ceiling: string | null, game: Game): void {
        this.ceiling = (ceiling === null) ? null : new Ceiling(this, ceiling);
        if(this.ceiling !== null) this.ceiling.emitInstantiateEvent(game);

        this.setTicks();
    }

    /** Tries to place the block for this cell and returns success */
    placeBlock(block: string, game: Game): boolean {
        if(this.block !== null) return false;
        this.block = new Block(this, block);
        if(this.block !== null) this.block.emitInstantiateEvent(game);

        this.setTicks();
        return true;
    }

    /** Tries to place the floor for this cell and returns success */
    placeFloor(floor: string, game: Game): boolean {
        if(this.floor === null) return false;
        if(this.basefloor !== null) if(this.floor.definition.getRegistryKey() !== this.basefloor.getRegistryKey()) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;
        this.floor = new Floor(this, floor);
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.setTicks();
        return true;
    }

    /** Tries to place the ceiling for this cell and returns success */
    placeCeiling(ceiling: string, game: Game): boolean {
        if(this.ceiling !== null) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;
        this.ceiling = new Ceiling(this, ceiling);
        if(this.ceiling !== null) this.ceiling.emitInstantiateEvent(game);

        this.setTicks();
        return true;
    }

    /** Tries to break the block for this cell and returns success */
    breakBlock(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        if(this.block === null) return false;

        this.block.emitBreakEvent(game);
        this.block.definition.break(x, y, toggledrop, game);
        this.block = null;

        this.setTicks();
        return true;
    }

    /** Tries to break the floor for this cell and returns success */
    breakFloor(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        if(this.floor === null) return false;
        if(this.floor.definition === this.basefloor) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;

        this.floor.emitBreakEvent(game);
        this.floor.definition.break(x, y, toggledrop, game);
        this.floor = null;
        if(this.basefloor !== null) this.floor = new Floor(this, this.basefloor.getRegistryKey());
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.setTicks();
        return true;
    }

    /** Tries to break the ceiling for this cell and returns success */
    breakCeiling(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        if(this.ceiling === null) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;

        this.ceiling.emitBreakEvent(game);
        this.ceiling.definition.break(x, y, toggledrop, game);
        this.ceiling = null;

        this.setTicks();
        return true;
    }

    /** Sets the base floor for this cell */
    setBaseFloor(floor: string | null, game: Game): void {
        const floorval = (floor === null) ? null : FloorRegistry.get(floor);
        this.floor = floorval ? new Floor(this, floorval.getRegistryKey()) : null;
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);
        this.basefloor = floorval;

        this.setTicks();
    }

    // #endregion

    // #region getters

    /** Returns the world x of this cell */
    getWorldX(): number {
        return this.chunk.chunkx * CHUNK_SIZE + this.chunkx;
    }

    /** Returns the world y of this cell */
    getWorldY(): number {
        return this.chunk.chunky * CHUNK_SIZE + this.chunky;
    }

    // #endregion

    // #region events

    unload(game: Game): void {
        if(this.block !== null) this.block.emitUnloadEvent(game);
        if(this.floor !== null) this.floor.emitUnloadEvent(game);
        if(this.ceiling !== null) this.ceiling.emitUnloadEvent(game);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this cells data for loading to the client */
    serializeForLoad(): any {
        const data: any = {};

        if(this.block) data.block = this.block.definition.getRegistryKey();
        if(this.floor) data.floor = this.floor.definition.getRegistryKey();
        if(this.ceiling) data.ceiling = this.ceiling.definition.getRegistryKey();

        return data;
    }

    /** Returns an object representing this cells data for writing to the save */
    serializeForWrite(): any {
        const data: any = {};

        if(this.basefloor) data.basefloor = this.basefloor.getRegistryKey();
        if(this.block) data.block = this.block.serializeForWrite();
        if(this.floor) data.floor = this.floor.serializeForWrite();
        if(this.ceiling) data.ceiling = this.ceiling.serializeForWrite();

        return data;
    }

    // #endregion
}

export default Cell;