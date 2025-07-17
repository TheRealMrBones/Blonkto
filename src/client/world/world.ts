import PlayerClient from "../playerClient.js";

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** The representation of world data currently loaded by the client */
class World {
    private readonly playerclient: PlayerClient;
    private readonly chunks: {[key: string]: any} = {};

    private readonly blockdefinitions: {[key: string]: any} = {};
    private readonly floordefinitions: {[key: string]: any} = {};
    private readonly ceilingdefinitions: {[key: string]: any} = {};

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    // #region definitions

    /** Saves the requested definitions to the client if not already there */
    saveDefinitions(blockdefinitions: any[], floordefinitions: any[], ceilingdefinitions: any[]): void {
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
    loadChunks(chunks: any[]): void {
        chunks.forEach(chunk => {
            this.loadChunk(chunk);
        });
    }

    /** Load the requested chunk based on the given chunk data */
    private loadChunk(chunk: any): void {
        this.chunks[[chunk.x,chunk.y].toString()] = chunk;
    }

    /** Unload the requested chunks based on the given chunks data */
    unloadChunks(chunks: any[]): void {
        chunks.forEach(chunk => {
            this.unloadChunk(chunk);
        });
    }

    /** Unload the requested chunk based on the given chunk data */
    private unloadChunk(chunk: any): void {
        delete this.chunks[[chunk.x,chunk.y].toString()];
    }

    // #endregion

    // #region cells

    /** Update the given cells with their new data */
    updateCells(cellUpdates: any[]): void {
        cellUpdates.forEach(cellUpdate => {
            this.updateCell(cellUpdate);
        });
    }

    /** Update the given cell with its new data */
    private updateCell(cellUpdate: any): void {
        const chunkx = Math.floor(cellUpdate.x / CHUNK_SIZE);
        const chunky = Math.floor(cellUpdate.y / CHUNK_SIZE);
        const cellx = cellUpdate.x - chunkx * CHUNK_SIZE;
        const celly = cellUpdate.y - chunky * CHUNK_SIZE;

        const chunk = this.chunks[[chunkx,chunky].toString()];
        if(chunk) chunk.cells[cellx][celly] = cellUpdate.data;
    }

    /** Returns the requested cells data if it exists or returns default values (empty) otherwise */
    getCell(x: number, y: number): any {
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);
        const cellx = x - chunkx * CHUNK_SIZE;
        const celly = y - chunky * CHUNK_SIZE;

        const chunk = this.chunks[[chunkx,chunky].toString()];
        if(!chunk){
            return this.getDefaultCell();
        }else{
            const cell = chunk.cells[cellx][celly];
            const returnobj: any = {};

            if(cell.block) returnobj.block = this.blockdefinitions[cell.block];
            if(cell.floor) returnobj.floor = this.floordefinitions[cell.floor];
            if(cell.ceiling) returnobj.ceiling = this.ceilingdefinitions[cell.ceiling];

            return returnobj;
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
