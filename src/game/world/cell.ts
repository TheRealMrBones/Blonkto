import SharedConfig from "configs/shared.js";
import FloorDefinition from "game/definitions/floorDefinition.js";
import Game from "game/game.js";
import FloorRegistry from "game/registries/floorRegistry.js";
import Block from "game/world/block.js";
import Ceiling from "game/world/ceiling.js";
import Chunk from "game/world/chunk.js";
import Floor from "game/world/floor.js";
import { SerializedLoadCell, SerializedWriteCell } from "shared/serialization/world/serializedCell.js";

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

    private ticks: boolean = false;

    constructor(chunk: Chunk, chunkx: number, chunky: number, basefloor: string | null){
        this.chunk = chunk;
        this.chunkx = chunkx;
        this.chunky = chunky;

        this.basefloor = basefloor ? FloorRegistry.get(basefloor) : null;
        this.floor = this.basefloor ? new Floor(this, this.basefloor.key) : null;
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

    // #region on update

    /** Does proper update procedures after a change to this cell */
    onUpdate(): void {
        this.setTicks();
        this.pushCellUpdate();
    }

    /** Sets the ticks boolean based on if any of the parts of this cell listen to ticks */
    private setTicks(): void {
        this.ticks = false;
        if(this.block !== null) if(this.block.definition.ticks()) this.ticks = true;
        if(this.floor !== null) if(this.floor.definition.ticks()) this.ticks = true;
        if(this.ceiling !== null) if(this.ceiling.definition.ticks()) this.ticks = true;
    }

    /** Pushes this cell in its chunks cell updates */
    private pushCellUpdate(): void {
        this.chunk.cellupdates.push({
            x: this.getWorldX(),
            y: this.getWorldY(),
        });
    }

    // endregion

    // #region setters

    /** Sets the block for this cell */
    setBlock(block: string | null, game: Game): void {
        if(this.block !== null) this.block.emitBreakEvent(game, false);

        this.block = (block === null) ? null : new Block(this, block);
        if(this.block !== null) this.block.emitInstantiateEvent(game);

        this.onUpdate();
    }

    /** Sets the floor for this cell */
    setFloor(floor: string | null, game: Game): void {
        if(this.floor !== null) this.floor.emitBreakEvent(game, false);

        this.floor = (floor === null) ? (this.basefloor ? new Floor(this, this.basefloor.key) : null) : new Floor(this, floor);
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.onUpdate();
    }

    /** Sets the ceiling for this cell */
    setCeiling(ceiling: string | null, game: Game): void {
        if(this.ceiling !== null) this.ceiling.emitBreakEvent(game, false);

        this.ceiling = (ceiling === null) ? null : new Ceiling(this, ceiling);
        if(this.ceiling !== null) this.ceiling.emitInstantiateEvent(game);

        this.onUpdate();
    }

    /** Tries to place the block for this cell and returns success */
    placeBlock(block: string, game: Game): boolean {
        if(this.block !== null) return false;
        this.block = new Block(this, block);
        if(this.block !== null) this.block.emitInstantiateEvent(game);

        this.onUpdate();
        return true;
    }

    /** Tries to place the floor for this cell and returns success */
    placeFloor(floor: string, game: Game): boolean {
        if(this.floor === null) return false;
        if(this.basefloor !== null) if(this.floor.definition.key !== this.basefloor.key) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;
        this.floor = new Floor(this, floor);
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.onUpdate();
        return true;
    }

    /** Tries to place the ceiling for this cell and returns success */
    placeCeiling(ceiling: string, game: Game): boolean {
        if(this.ceiling !== null) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;
        this.ceiling = new Ceiling(this, ceiling);
        if(this.ceiling !== null) this.ceiling.emitInstantiateEvent(game);

        this.onUpdate();
        return true;
    }

    /** Tries to break the block for this cell and returns success */
    breakBlock(toggledrop: boolean, game: Game): boolean {
        if(this.block === null) return false;

        this.block.emitBreakEvent(game, toggledrop);
        this.block = null;

        this.onUpdate();
        return true;
    }

    /** Tries to break the floor for this cell and returns success */
    breakFloor(toggledrop: boolean, game: Game): boolean {
        if(this.floor === null) return false;
        if(this.floor.definition === this.basefloor) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;

        this.floor.emitBreakEvent(game, toggledrop);
        this.floor = null;
        if(this.basefloor !== null) this.floor = new Floor(this, this.basefloor.key);
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);

        this.onUpdate();
        return true;
    }

    /** Tries to break the ceiling for this cell and returns success */
    breakCeiling(toggledrop: boolean, game: Game): boolean {
        if(this.ceiling === null) return false;
        if(this.block !== null)
            if(this.block.definition.getBlockCell()) return false;

        this.ceiling.emitBreakEvent(game, toggledrop);
        this.ceiling = null;

        this.onUpdate();
        return true;
    }

    /** Sets the base floor for this cell */
    setBaseFloor(floor: string | null, game: Game): void {
        if(this.floor !== null) this.floor.emitBreakEvent(game, false);

        const floorval = (floor === null) ? null : FloorRegistry.get(floor);
        this.floor = floorval ? new Floor(this, floorval.key) : null;
        if(this.floor !== null) this.floor.emitInstantiateEvent(game);
        this.basefloor = floorval;

        this.onUpdate();
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

    /** Emits a tick event to this cell */
    emitTickEvent(game: Game, dt: number): void {
        if(!this.ticks) return;

        if(this.block !== null) this.block.emitTickEvent(game, dt);
        if(this.floor !== null) this.floor.emitTickEvent(game, dt);
        if(this.ceiling !== null) this.ceiling.emitTickEvent(game, dt);
    }

    /** Emits an unload event to this cell */
    emitUnloadEvent(game: Game): void {
        if(this.block !== null) this.block.emitUnloadEvent(game);
        if(this.floor !== null) this.floor.emitUnloadEvent(game);
        if(this.ceiling !== null) this.ceiling.emitUnloadEvent(game);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this cells data for loading to the client */
    serializeForLoad(): SerializedLoadCell {
        const data: SerializedLoadCell = {};

        if(this.block){
            data.block = this.block.definition.key;
            const blockupdate = this.block.serializeForUpdate();

            if(Object.keys(blockupdate).length > 0)
                data.blockupdate = blockupdate;
        }

        if(this.floor){
            data.floor = this.floor.definition.key;
            const floorupdate = this.floor.serializeForUpdate();

            if(Object.keys(floorupdate).length > 0)
                data.floorupdate = floorupdate;
        }

        if(this.ceiling){
            data.ceiling = this.ceiling.definition.key;
            const ceilingupdate = this.ceiling.serializeForUpdate();

            if(Object.keys(ceilingupdate).length > 0)
                data.ceilingupdate = ceilingupdate;
        }

        return data;
    }

    /** Returns an object representing this cells data for writing to the save */
    serializeForWrite(): SerializedWriteCell {
        const data: SerializedWriteCell = {};

        if(this.basefloor) data.basefloor = this.basefloor.key;
        if(this.block) data.block = this.block.serializeForWrite();
        if(this.floor) data.floor = this.floor.serializeForWrite();
        if(this.ceiling) data.ceiling = this.ceiling.serializeForWrite();

        return data;
    }

    // #endregion
}

export default Cell;
