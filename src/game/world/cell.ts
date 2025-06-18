import BlockRegistry from "../registries/blockRegistry.js";
import FloorRegistry from "../registries/floorRegistry.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
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
    
    basefloor: Floor | null;
    block: Block | null = null;
    floor: Floor | null = null;
    ceiling: Ceiling | null = null;

    constructor(chunk: Chunk, chunkx: number, chunky: number, basefloor: string | null){
        this.chunk = chunk;
        this.chunkx = chunkx;
        this.chunky = chunky;
        
        this.basefloor = basefloor ? FloorRegistry.get(basefloor) : null;
        this.floor = this.basefloor;
    }

    // #region setters

    /** Sets the block for this cell */
    setBlock(block: string | null): void {
        this.block = (block === null) ? null : BlockRegistry.get(block);
    }

    /** Sets the floor for this cell */
    setFloor(floor: string | null): void {
        this.floor = (floor === null) ? this.basefloor : FloorRegistry.get(floor);
    }

    /** Sets the ceiling for this cell */
    setCeiling(ceiling: string | null): void {
        this.ceiling = (ceiling === null) ? null : CeilingRegistry.get(ceiling);
    }

    /** Tries to place the block for this cell and returns success */
    placeBlock(block: string): boolean {
        if(this.block !== null) return false;
        this.block = BlockRegistry.get(block);
        return true;
    }

    /** Tries to place the floor for this cell and returns success */
    placeFloor(floor: string): boolean {
        if(this.floor !== this.basefloor) return false;
        if(this.block !== null)
            if(this.block.blockscell) return false;
        this.floor = FloorRegistry.get(floor);
        return true;
    }

    /** Tries to place the ceiling for this cell and returns success */
    placeCeiling(ceiling: string): boolean {
        if(this.ceiling !== null) return false;
        if(this.block !== null)
            if(this.block.blockscell) return false;
        this.ceiling = CeilingRegistry.get(ceiling);
        return true;
    }

    /** Tries to break the block for this cell and returns success */
    breakBlock(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        this.block?.break(x, y, toggledrop, game);
        this.block = null;
        return true;
    }

    /** Tries to break the floor for this cell and returns success */
    breakFloor(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        if(this.floor === this.basefloor) return false;
        if(this.block !== null)
            if(this.block.blockscell) return false;
        this.floor?.break(x, y, toggledrop, game);
        this.floor = null;
        if(this.basefloor !== null) this.floor = this.basefloor;
        return true;
    }

    /** Tries to break the ceiling for this cell and returns success */
    breakCeiling(x: number, y: number, toggledrop: boolean, game: Game): boolean {
        if(this.block !== null)
            if(this.block.blockscell) return false;
        this.ceiling?.break(x, y, toggledrop, game);
        this.ceiling = null;
        return true;
    }

    /** Sets the base floor for this cell */
    setBaseFloor(floor: string | null): void {
        const floorval = (floor === null) ? null : FloorRegistry.get(floor);
        this.floor = floorval;
        this.basefloor = floorval;
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

    // #region serialization

    /** Return an object representing this cells data for loading to the game world */
    serializeForLoad(): any {
        const data: any = {};

        if(this.block) data.block = this.block.serializeForLoad();
        if(this.floor) data.floor = this.floor.serializeForLoad();
        if(this.ceiling) data.ceiling = this.ceiling.serializeForLoad();

        return data;
    }

    /** Return an object representing this cells data for writing to the save */
    serializeForWrite(): any {
        const data: any = {};

        if(this.basefloor) data.basefloor = this.basefloor.serializeForWrite();
        if(this.block) data.block = this.block.serializeForWrite();
        if(this.floor) data.floor = this.floor.serializeForWrite();
        if(this.ceiling) data.ceiling = this.ceiling.serializeForWrite();

        return data;
    }

    // #endregion
}

export default Cell;