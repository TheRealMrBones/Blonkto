const chunks: {[key: string]: any} = {};

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

// #region chunks

/** Load the requested chunks based on the given chunks data */
export function loadChunks(chunks: any[]): void {
    chunks.forEach(chunk => {
        loadChunk(chunk);
    });
}

/** Load the requested chunk based on the given chunk data */
function loadChunk(chunk: any): void {
    chunks[[chunk.x,chunk.y].toString()] = chunk;
}

/** Unload the requested chunks based on the given chunks data */
export function unloadChunks(chunks: any[]): void {
    chunks.forEach(chunk => {
        unloadChunk(chunk);
    });
}

/** Unload the requested chunk based on the given chunk data */
function unloadChunk(chunk: any): void {
    delete chunks[[chunk.x,chunk.y].toString()];
}

// #endregion

// #region cells

/** Update the given cells with their new data */
export function updateCells(cellUpdates: any[]): void {
    cellUpdates.forEach(cellUpdate => {
        updateCell(cellUpdate);
    });
}

/** Update the given cell with its new data */
function updateCell(cellUpdate: any): void {
    const chunkx = Math.floor(cellUpdate.x / CHUNK_SIZE);
    const chunky = Math.floor(cellUpdate.y / CHUNK_SIZE);
    const cellx = cellUpdate.x - chunkx * CHUNK_SIZE;
    const celly = cellUpdate.y - chunky * CHUNK_SIZE;

    const chunk = chunks[[chunkx,chunky].toString()];
    if(chunk) chunk.cells[cellx][celly] = cellUpdate.data;
}

/** Returns the requested cells data if it exists or returns default values (empty) otherwise */
export function getCell(x: number, y: number): any {
    const chunkx = Math.floor(x / CHUNK_SIZE);
    const chunky = Math.floor(y / CHUNK_SIZE);
    const cellx = x - chunkx * CHUNK_SIZE;
    const celly = y - chunky * CHUNK_SIZE;

    const chunk = chunks[[chunkx,chunky].toString()];
    if(!chunk){
        return getDefaultCell();
    }else{
        return chunk.cells[cellx][celly];
    }
}

// #endregion

// #region helpers

/** Returns the default cell data (empty) */
function getDefaultCell(): any {
    return {};
}

// #endregion