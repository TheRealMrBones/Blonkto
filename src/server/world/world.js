const Constants = require('../../shared/constants.js');
const Chunk = require('./chunk.js');

class World {
    constructor(){
        this.spawnpoints = [[0, 0]];
        // key for each chunk is [x,y].toString()
        this.loadedchunks = {};
        this.generateSpawn();
    }

    generateSpawn(){
        for(let x = -Constants.SPAWN_SIZE / 2 - 1; x < Constants.SPAWN_SIZE / 2 + 1; x++){
            for(let y = -Constants.SPAWN_SIZE / 2 - 1; y < Constants.SPAWN_SIZE / 2 + 1; y++){
                this.loadedchunks[[x,y].toString()] = new Chunk(x, y);
            }
        }
    }

    getSpawn(){
        while(true){
            // get random x y in spawn
            const len = Constants.SPAWN_SIZE * Constants.CHUNK_SIZE;
            const x = Math.floor(Math.random() * (len - 1)) - (len / 2);
            const y = Math.floor(Math.random() * (len - 1)) - (len / 2);
            const pos = { x: x + .5, y: y + .5 };

            // get chunk of that spawn
            const chunkx = Math.floor((x + Constants.CHUNK_SIZE / 2) / Constants.CHUNK_SIZE);
            const chunky = Math.floor((y + Constants.CHUNK_SIZE / 2) / Constants.CHUNK_SIZE);
            const chunk = { x: chunkx, y: chunky };

            // check if valid spawn
            const cell = this.getCell(x, y);
            if(!cell.block){
                return {
                    pos: pos,
                    chunk: chunk,
                };
            }
        }
    }

    loadPlayerChunks(player){
        // get bottom right of chunk 2 by 2 to load
        const x = Math.floor(player.x / Constants.CHUNK_SIZE);
        const y = Math.floor(player.y / Constants.CHUNK_SIZE);
        const newChunk = { x: x, y: y };
        if(x == player.chunk.x && y == player.chunk.y){
            // no need to load and unload chunks if already loaded
            return { chunk: newChunk };
        }else{
            // get positions of new and old chunks
            const newChunks = [
                { x: x, y: y},
                { x: x, y: y - 1},
                { x: x, y: y + 1},
                { x: x - 1, y: y},
                { x: x - 1, y: y - 1},
                { x: x - 1, y: y + 1},
                { x: x + 1, y: y},
                { x: x + 1, y: y - 1},
                { x: x + 1, y: y + 1},
            ];
            const oldChunks = [
                { x: player.chunk.x, y: player.chunk.y},
                { x: player.chunk.x, y: player.chunk.y - 1},
                { x: player.chunk.x, y: player.chunk.y + 1},
                { x: player.chunk.x - 1, y: player.chunk.y},
                { x: player.chunk.x - 1, y: player.chunk.y - 1},
                { x: player.chunk.x - 1, y: player.chunk.y + 1},
                { x: player.chunk.x + 1, y: player.chunk.y},
                { x: player.chunk.x + 1, y: player.chunk.y - 1},
                { x: player.chunk.x + 1, y: player.chunk.y + 1},
            ];

            // get chunks that are in both
            const sameChunks = [];
            newChunks.forEach(nc => {
                oldChunks.forEach(oc => {
                    if(nc.x == oc.x && nc.y == oc.y){
                        sameChunks.push(nc);
                    }
                });
            });

            // compare new and old chunks to same chunks to find which ones to load and unload
            const loadChunks = [];
            const unloadChunks = [];
            newChunks.forEach(nc => {
                let isNew = true;
                sameChunks.forEach(sc => {
                    if(nc.x == sc.x && nc.y == sc.y){
                        isNew = false;
                    }
                });
                if(isNew){
                    loadChunks.push(nc);
                }
            });
            oldChunks.forEach(oc => {
                let isOld = true;
                sameChunks.forEach(sc => {
                    if(oc.x == sc.x && oc.y == sc.y){
                        isOld = false;
                    }
                });
                if(isOld){
                    unloadChunks.push(oc);
                }
            });

            // serialize load chunks
            const loadChunksSerialized = [];
            loadChunks.forEach(lc => {
                const chunk = this.loadedchunks[[lc.x,lc.y].toString()];
                if(chunk){
                    loadChunksSerialized.push(chunk.serializeForLoad());
                }else if(lc.x >= -Constants.WORLD_SIZE / 2 && lc.x < Constants.WORLD_SIZE / 2 && lc.y >= -Constants.WORLD_SIZE / 2 && lc.y < Constants.WORLD_SIZE / 2){
                    const newChunk = new Chunk(lc.x, lc.y);
                    this.loadedchunks[[lc.x,lc.y].toString()] = newChunk;
                    loadChunksSerialized.push(newChunk.serializeForLoad());
                }
            });

            // send the data
            return {
                chunk: newChunk,
                loadChunks: loadChunksSerialized,
                unloadChunks: unloadChunks,
            };
        }
    }

    getCell(x, y){
        const chunkx = Math.floor(x / Constants.CHUNK_SIZE);
        const chunky = Math.floor(y / Constants.CHUNK_SIZE);
        const cellx = x - chunkx * Constants.CHUNK_SIZE;
        const celly = y - chunky * Constants.CHUNK_SIZE;
    
        const chunk = this.loadedchunks[[chunkx,chunky].toString()];
        if(!chunk){
            return false;
        }else{
            return chunk.cells[cellx][celly];
        }
    }
}

module.exports = World;