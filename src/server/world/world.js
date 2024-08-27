const Constants = require('../../shared/constants.js');
const Chunk = require('./chunk.js');

class World {
    constructor(){
        // key for each chunk is [x,y].toString()
        this.loadedchunks = {};
        this.generateSpawn();
    }

    // #region Spawn

    generateSpawn(){
        for(let x = -Constants.SPAWN_SIZE / 2 - 1; x < Constants.SPAWN_SIZE / 2 + 1; x++){
            for(let y = -Constants.SPAWN_SIZE / 2 - 1; y < Constants.SPAWN_SIZE / 2 + 1; y++){
                this.loadedchunks[[x,y].toString()] = new Chunk(x, y);
                this.unloadChunk(x, y);
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
            const cell = this.getCell(x, y, true);
            if(!cell.block){
                return {
                    pos: pos,
                    chunk: chunk,
                };
            }
        }
    }

    // #endregion

    // #region Player

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

            // load chunks
            const loadChunksSerialized = [];
            loadChunks.forEach(lc => {
                const chunk = this.getChunk(lc.x, lc.y, true);
                if(chunk){
                    loadChunksSerialized.push(chunk.serializeForLoad());
                }
            });

            // unload chunks
            unloadChunks.forEach(c => {
                this.unloadChunk(c.x, c.y);
            });

            // send the data
            return {
                chunk: newChunk,
                loadChunks: loadChunksSerialized,
                unloadChunks: unloadChunks,
            };
        }
    }

    getPlayerChunks(player){
        return [
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
    }

    // #endregion

    // #region Chunks

    getChunk(x, y, canloadnew){
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            return chunk;
        }else if(x >= -Constants.WORLD_SIZE / 2 && x < Constants.WORLD_SIZE / 2 && y >= -Constants.WORLD_SIZE / 2 && y < Constants.WORLD_SIZE / 2 && canloadnew){
            const newChunk = new Chunk(x, y);
            this.loadedchunks[[x,y].toString()] = newChunk;
            return newChunk;
        }else{
            return false;
        }
    }

    unloadChunk(x, y){
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            delete this.loadedchunks[[x,y].toString()];
        }
    }
    
    tickChunkUnloader(players){
        const activeChunks = [];
        players.forEach(p => {
            activeChunks.push(...this.getPlayerChunks(p));
        });

        Object.values(this.loadedchunks).forEach(c => {
            if(!activeChunks.find(ac => ac.x == c.chunkx && ac.y == c.chunky)){
                this.unloadChunk(c.x, c.y);
            }
        });
    }

    // #endregion

    // #region Cells

    getCell(x, y, canloadnew){
        const chunkx = Math.floor(x / Constants.CHUNK_SIZE);
        const chunky = Math.floor(y / Constants.CHUNK_SIZE);
        const cellx = x - chunkx * Constants.CHUNK_SIZE;
        const celly = y - chunky * Constants.CHUNK_SIZE;
    
        const chunk = this.getChunk(chunkx, chunky, canloadnew);
        if(chunk){
            return chunk.cells[cellx][celly];
        }else{
            return false;
        }
    }

    breakcell(x, y){
        const cell = this.getCell(x, y, false);
        if(cell){
            if(cell.block){
                cell.block = false;
                return true;
            }else{
                return false;
            }
        }
    }

    placecell(x, y, block){
        const cell = this.getCell(x, y, false);
        if(cell){
            if(!cell.block){
                cell.block = block;
                return true;
            }else{
                return false;
            }
        }
    }

    // #endregion
}

module.exports = World;