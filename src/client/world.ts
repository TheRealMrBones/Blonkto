const chunks: {[key: string]: any} = {};

import SharedConfig from "../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

// #region chunks

export function loadChunks(chunks: any[]){
    chunks.forEach(chunk => {
        loadChunk(chunk);
    });
}

function loadChunk(chunk: any){
    chunks[[chunk.x,chunk.y].toString()] = chunk;
}

export function unloadChunks(chunks: any[]){
    chunks.forEach(chunk => {
        unloadChunk(chunk);
    });
}

function unloadChunk(chunk: any){
    delete chunks[[chunk.x,chunk.y].toString()];
}

// #endregion

// #region cells

export function updateCells(cellUpdates: any[]){
    cellUpdates.forEach(cellUpdate => {
        updateCell(cellUpdate);
    });
}

function updateCell(cellUpdate: any){
    const chunkx = Math.floor(cellUpdate.x / CHUNK_SIZE);
    const chunky = Math.floor(cellUpdate.y / CHUNK_SIZE);
    const cellx = cellUpdate.x - chunkx * CHUNK_SIZE;
    const celly = cellUpdate.y - chunky * CHUNK_SIZE;

    const chunk = chunks[[chunkx,chunky].toString()];
    if(chunk){
        chunk.cells[cellx][celly] = cellUpdate.data;
    }
}

export function getCell(x: number, y: number){
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

function getDefaultCell(){
    return {};
}

// #endregion