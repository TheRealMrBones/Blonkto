import PlayerClient from "../playerClient.js";
import { SerializedCellUpdate, SerializedWorldLoad } from "../../shared/serialization/world/serializedWorldLoad.js";
import { Vector2D } from "../../shared/types.js";
import { SerializedInitBlock } from "../../shared/serialization/world/serializedBlock.js";
import { SerializedInitFloor } from "../../shared/serialization/world/serializedFloor.js";
import { SerializedInitCeiling } from "../../shared/serialization/world/serializedCeiling.js";
import { SerializedLoadChunk } from "../../shared/serialization/world/serializedChunk.js";
import { Chunk } from "./chunk.js";
import { Cell } from "./cell.js";

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** The representation of world data currently loaded by the client */
class World {
    private readonly playerclient: PlayerClient;
    private readonly chunks: {[key: string]: Chunk} = {};

    private readonly blockdefinitions: {[key: string]: SerializedInitBlock} = {};
    private readonly floordefinitions: {[key: string]: SerializedInitFloor} = {};
    private readonly ceilingdefinitions: {[key: string]: SerializedInitCeiling} = {};

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    // #region management

    /** Updates this clients world data with the given world load information */
    updateWorld(data: SerializedWorldLoad): void {
        this.playerclient.world.saveDefinitions(data.usedblocks, data.usedfloors, data.usedceilings);
        this.playerclient.world.unloadChunks(data.unloadChunks);
        this.playerclient.world.loadChunks(data.loadChunks);
        this.playerclient.world.updateCells(data.updatedcells);
    }

    // #endregion

    // #region definitions

    /** Saves the requested definitions to the client if not already there */
    saveDefinitions(blockdefinitions: SerializedInitBlock[], floordefinitions: SerializedInitFloor[], ceilingdefinitions: SerializedInitCeiling[]): void {
        for(const blockdefinition of blockdefinitions){
            if(blockdefinition.name in this.blockdefinitions) continue;
            this.blockdefinitions[blockdefinition.name] = blockdefinition;
        }
        for(const floordefinition of floordefinitions){
            if(floordefinition.name in this.floordefinitions) continue;
            this.floordefinitions[floordefinition.name] = floordefinition;
        }
        for(const ceilingdefinition of ceilingdefinitions){
            if(ceilingdefinition.name in this.ceilingdefinitions) continue;
            this.ceilingdefinitions[ceilingdefinition.name] = ceilingdefinition;
        }
    }

    // #endregion

    // #region chunks

    /** Load the requested chunks based on the given chunks data */
    loadChunks(chunks: SerializedLoadChunk[]): void {
        chunks.forEach(chunk => {
            this.loadChunk(chunk);
        });
    }

    /** Load the requested chunk based on the given chunk data */
    private loadChunk(chunk: SerializedLoadChunk): void {
        const newchunk: Chunk = {
            x: chunk.x,
            y: chunk.y,
            cells: [],
        };

        for(let x = 0; x < CHUNK_SIZE; x++){
            newchunk.cells.push([]);

            for(let y = 0; y < CHUNK_SIZE; y++){
                const cell: Cell = {
                    animated: false,
                };

                if(chunk.cells[x][y].block !== undefined)
                    cell.block = {...this.blockdefinitions[chunk.cells[x][y].block!]};
                if(chunk.cells[x][y].floor !== undefined)
                    cell.floor = {...this.floordefinitions[chunk.cells[x][y].floor!]};
                if(chunk.cells[x][y].ceiling !== undefined)
                    cell.ceiling = {...this.ceilingdefinitions[chunk.cells[x][y].ceiling!]};

                this.updateCellAnimated(cell);

                newchunk.cells[x].push(cell);
            }
        }

        this.chunks[[chunk.x,chunk.y].toString()] = newchunk;
    }

    /** Unload the requested chunks based on the given chunks data */
    unloadChunks(chunks: Vector2D[]): void {
        chunks.forEach(chunk => {
            this.unloadChunk(chunk);
        });
    }

    /** Unload the requested chunk based on the given chunk data */
    private unloadChunk(chunk: Vector2D): void {
        delete this.chunks[[chunk[0],chunk[1]].toString()];
    }

    // #endregion

    // #region cells

    /** Update the given cells with their new data */
    updateCells(cellUpdates: SerializedCellUpdate[]): void {
        cellUpdates.forEach(cellUpdate => {
            this.updateCell(cellUpdate);

            const cell = this.getCell(cellUpdate.x, cellUpdate.y);
            this.playerclient.renderer.renderCellUpdates(cellUpdate.x, cellUpdate.y, cell);
        });
    }

    /** Update the given cell with its new data */
    private updateCell(cellUpdate: SerializedCellUpdate): void {
        const chunkx = Math.floor(cellUpdate.x / CHUNK_SIZE);
        const chunky = Math.floor(cellUpdate.y / CHUNK_SIZE);
        const cellx = cellUpdate.x - chunkx * CHUNK_SIZE;
        const celly = cellUpdate.y - chunky * CHUNK_SIZE;

        const chunk = this.chunks[[chunkx,chunky].toString()];
        if(chunk === undefined) return;

        chunk.cells[cellx][celly].block = cellUpdate.data.block !== undefined ?
            {...this.blockdefinitions[cellUpdate.data.block!]} : undefined;
        chunk.cells[cellx][celly].floor = cellUpdate.data.floor !== undefined ?
            {...this.floordefinitions[cellUpdate.data.floor!]} : undefined;
        chunk.cells[cellx][celly].ceiling = cellUpdate.data.ceiling !== undefined ?
            {...this.ceilingdefinitions[cellUpdate.data.ceiling!]} : undefined;

        if(cellUpdate.data.blockupdate !== undefined){
            for(const prop of Object.keys(cellUpdate.data.blockupdate)){
                (chunk.cells[cellx][celly].block as any)[prop] = (cellUpdate.data.blockupdate as any)[prop];
            }
        }

        if(cellUpdate.data.floorupdate !== undefined){
            for(const prop of Object.keys(cellUpdate.data.floorupdate)){
                (chunk.cells[cellx][celly].floor as any)[prop] = (cellUpdate.data.floorupdate as any)[prop];
            }
        }

        if(cellUpdate.data.ceilingupdate !== undefined){
            for(const prop of Object.keys(cellUpdate.data.ceilingupdate)){
                (chunk.cells[cellx][celly].ceiling as any)[prop] = (cellUpdate.data.ceilingupdate as any)[prop];
            }
        }

        this.updateCellAnimated(chunk.cells[cellx][celly]);
    }

    /** Updates the animated property of the given cell */
    updateCellAnimated(cell: Cell): void {
        cell.animated = false;

        if(cell.block !== undefined)
            if(this.playerclient.renderer.assetManager.isAnimation(cell.block.asset))
                cell.animated = true;

        if(cell.floor !== undefined)
            if(this.playerclient.renderer.assetManager.isAnimation(cell.floor.asset))
                cell.animated = true;

        if(cell.ceiling !== undefined)
            if(this.playerclient.renderer.assetManager.isAnimation(cell.ceiling.asset))
                cell.animated = true;
    }

    /** Returns the requested cells data if it exists or returns default values (empty) otherwise */
    getCell(x: number, y: number): Cell {
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);
        const cellx = x - chunkx * CHUNK_SIZE;
        const celly = y - chunky * CHUNK_SIZE;

        const chunk = this.chunks[[chunkx,chunky].toString()];
        if(!chunk){
            return this.getDefaultCell();
        }else{
            const cell = chunk.cells[cellx][celly];

            return cell;
        }
    }

    // #endregion

    // #region helpers

    /** Returns the default cell data (empty) */
    private getDefaultCell(): any {
        return {};
    }

    // #endregion
}

export default World;
