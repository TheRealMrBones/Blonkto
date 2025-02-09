import Chunk from './chunk.js';

import SharedConfig from '../../configs/shared';
const { WORLD_SIZE, CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from '../../configs/server';
const { SPAWN_SIZE, AUTOSAVE_RATE } = ServerConfig.WORLD;

class World {
    constructor(fm){
        this.fileManager = fm;

        // key for each chunk is [x,y].toString()
        this.loadedchunks = {};
        this.generateSpawn();

        this.saveInterval = setInterval(this.saveWorld.bind(this), 1000 * AUTOSAVE_RATE);
    }

    // #region Spawn

    generateSpawn(){
        for(let x = -SPAWN_SIZE / 2 - 1; x < SPAWN_SIZE / 2 + 1; x++){
            for(let y = -SPAWN_SIZE / 2 - 1; y < SPAWN_SIZE / 2 + 1; y++){
                const chunk = this.getChunk(x, y, true);
                this.unloadChunk(x, y);
            }
        }
    }

    getSpawn(){
        while(true){
            // get random x y in spawn
            const len = SPAWN_SIZE * CHUNK_SIZE;
            const x = Math.floor(Math.random() * (len - 1)) - (len / 2);
            const y = Math.floor(Math.random() * (len - 1)) - (len / 2);
            const pos = { x: x + .5, y: y + .5 };

            // get chunk of that spawn
            const chunkx = Math.floor((x + CHUNK_SIZE / 2) / CHUNK_SIZE);
            const chunky = Math.floor((y + CHUNK_SIZE / 2) / CHUNK_SIZE);
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
        const x = Math.floor(player.x / CHUNK_SIZE);
        const y = Math.floor(player.y / CHUNK_SIZE);
        const newChunk = { x: x, y: y };

        const returnobj = { chunk: newChunk };

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

        // send chunk updates for same chunks
        const updatedcells = [];
        sameChunks.forEach(sc => {
            const chunk = this.getChunk(sc.x, sc.y, false);
            if(chunk){
                chunk.cellUpdates.forEach(cellupdate => {
                    updatedcells.push({
                        data: this.getCell(cellupdate.x, cellupdate.y, false).serializeForLoad(),
                        x: cellupdate.x,
                        y: cellupdate.y,
                    });
                })
            }
        });

        returnobj.updatedcells = updatedcells;

        if(x == player.chunk.x && y == player.chunk.y){
            // no need to load and unload chunks if already loaded
        }else{
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

            // append data to return obj
            returnobj.loadChunks = loadChunksSerialized;
            returnobj.unloadChunks = unloadChunks;
        }

        return returnobj;
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

    // #region World

    saveWorld(){
        Object.values(this.loadedchunks).forEach(c => {
            this.writeChunkFile(c);
        });
    }

    // #endregion

    // #region Chunks

    getChunk(x, y, canloadnew){
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            return chunk;
        }else if(x >= -WORLD_SIZE / 2 && x < WORLD_SIZE / 2 && y >= -WORLD_SIZE / 2 && y < WORLD_SIZE / 2 && canloadnew){
            let newChunk;

            if(this.chunkFileExists(x, y)){
                newChunk = new Chunk(x, y, this.readChunkFile(x, y));
            }else{
                newChunk = new Chunk(x, y);
            }
            
            this.loadedchunks[[x,y].toString()] = newChunk;
            return newChunk;
        }else{
            return false;
        }
    }

    unloadChunk(x, y){
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            this.writeChunkFile(chunk);
            delete this.loadedchunks[[x,y].toString()];
        }
    }

    chunkFileExists(x, y){
        const fileLocation = "world/" + [x,y].toString();

        return this.fileManager.fileExists(fileLocation);
    }

    readChunkFile(x, y){
        const fileLocation = "world/" + [x,y].toString();

        return this.fileManager.readFile(fileLocation);
    }

    writeChunkFile(chunk){
        const fileLocation = "world/" + [chunk.chunkx,chunk.chunky].toString();
        let chunkdata = chunk.serializeForWrite();

        this.fileManager.writeFile(fileLocation, chunkdata);
    }
    
    tickChunkUnloader(players){
        const activeChunks = [];
        players.forEach(p => {
            activeChunks.push(...this.getPlayerChunks(p));
        });

        Object.values(this.loadedchunks).forEach(c => {
            if(!activeChunks.find(ac => ac.x == c.chunkx && ac.y == c.chunky)){
                this.unloadChunk(c.chunkx, c.chunky);
            }
        });
    }

    resetCellUpdates(){
        Object.values(this.loadedchunks).forEach(chunk => {
            chunk.cellUpdates = [];
        });
    }

    // #endregion

    // #region Cells

    getCell(x, y, canloadnew){
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);
        const cellx = x - chunkx * CHUNK_SIZE;
        const celly = y - chunky * CHUNK_SIZE;
    
        const chunk = this.getChunk(chunkx, chunky, canloadnew);
        if(chunk){
            return chunk.cells[cellx][celly];
        }else{
            return false;
        }
    }

    getCellAndChunk(x, y, canloadnew){
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);

        const cell = this.getCell(x, y, canloadnew);
        if(cell){
            return {
                cell: cell,
                chunk: this.getChunk(chunkx, chunky, false),
            }
        }else{
            return false;
        }
    }

    breakcell(x, y){
        const data = this.getCellAndChunk(x, y, false);
        if(!data){
            return false;
        }
        
        const { cell, chunk } = this.getCellAndChunk(x, y, false);
        if(cell.block){
            cell.block = null;

            chunk.cellUpdates.push({
                x, y
            });
            return true;
        }else{
            return false;
        }
    }

    placecell(x, y, block){
        const data = this.getCellAndChunk(x, y, false);
        if(!data){
            return false;
        }

        const { cell, chunk } = this.getCellAndChunk(x, y, false);
        if(!cell.block){
            cell.placeBlock(block);

            chunk.cellUpdates.push({
                x, y
            });
            return true;
        }else{
            return false;
        }
    }

    cellEmpty(x, y, entities){
        const chunk = { x: Math.floor(x / CHUNK_SIZE), y: Math.floor(y / CHUNK_SIZE) };
        
        let empty = true;
        entities.forEach(e => {
            if(Math.abs(e.chunk.x - chunk.x) <= 1 && Math.abs(e.chunk.y - chunk.y) <= 1){
                if(e.tilesOn().some(t => t.x == x && t.y == y)){
                    empty = false;
                }
            }
        });

        return empty;
    }

    // #endregion
}

export default World;