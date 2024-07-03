const chunks = {};

const Constants = require('../shared/constants.js');
const { CHUNK_SIZE, ASSETS } = Constants;

export function loadChunks(chunks){
    chunks.forEach(chunk => {
        loadChunk(chunk);
    });
}

function loadChunk(chunk){
    chunks[[chunk.x,chunk.y].toString()] = chunk;
}

export function unloadChunks(chunks){
    chunks.forEach(chunk => {
        unloadChunk(chunk);
    });
}

function unloadChunk(chunk){
    delete chunks[[chunk.x,chunk.y].toString()];
}

export function getCell(x, y){
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

function getDefaultCell(){
    return {};
}