import PlayerClient from "../playerClient.js";

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

/** The representation of world data currently loaded by the client */
class World {
    private readonly playerclient: PlayerClient;
    private readonly chunks: {[key: string]: any} = {};

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

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
            return chunk.cells[cellx][celly];
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