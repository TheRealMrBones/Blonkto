import BlockRegistry from "../registries/blockRegistry.js";
import FloorRegistry from "../registries/floorRegistry.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import Block from "./block.js";
import Floor from "./floor.js";
import Ceiling from "./ceiling.js";

/** Represents a single cell in the game world and its block, floor, and ceiling */
class Cell {
    block: Block | null;
    floor: Floor | null;
    ceiling: Ceiling | null;

    constructor(block: string | null, floor: string | null, ceiling: string | null){
        this.block = block ? BlockRegistry.get(block) : null;
        this.floor = floor ? FloorRegistry.get(floor) : null;
        this.ceiling = ceiling ? CeilingRegistry.get(ceiling) : null;
    }

    // #region setters

    /** Sets the block for this cell */
    placeBlock(block: string): void {
        this.block = BlockRegistry.get(block);
    }

    /** Sets the floor for this cell */
    placeFloor(floor: string): void {
        this.floor = FloorRegistry.get(floor);
    }

    /** Sets the ceiling for this cell */
    placeCeiling(ceiling: string): void {
        this.ceiling = CeilingRegistry.get(ceiling);
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

        if(this.block) data.block = this.block.serializeForWrite();
        if(this.floor) data.floor = this.floor.serializeForWrite();
        if(this.ceiling) data.ceiling = this.ceiling.serializeForWrite();

        return data;
    }

    // #endregion
}

export default Cell;