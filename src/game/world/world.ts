import Chunk from "./chunk.js";
import Cell from "./cell.js";
import DroppedStack from "../objects/droppedStack.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import GameObject from "../objects/gameObject.js";

import SharedConfig from "../../configs/shared.js";
const { WORLD_SIZE, CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from "../../configs/server.js";
const { SPAWN_SIZE, AUTOSAVE_RATE } = ServerConfig.WORLD;

const worldsavedir = "world/";

/** Manages the reading, loading, and unloading of the game world along withe the loading and unloading of ticking entities inside of it */
class World {
    game: Game;
    loadedchunks: {[key: string]: Chunk};
    saveInterval: NodeJS.Timeout;

    constructor(game: Game){
        this.game = game;

        // key for each chunk is [x,y].toString()
        this.loadedchunks = {};
        this.generateSpawn();

        this.saveInterval = setInterval(this.saveWorld.bind(this), 1000 * AUTOSAVE_RATE);
    }

    // #region Spawn

    /** Pregenerates the spawn region of the world if needed */
    generateSpawn(): void {
        for(let x = -SPAWN_SIZE / 2 - 1; x < SPAWN_SIZE / 2 + 1; x++){
            for(let y = -SPAWN_SIZE / 2 - 1; y < SPAWN_SIZE / 2 + 1; y++){
                const chunk = this.getChunk(x, y, true);
                this.unloadChunk(x, y);
            }
        }
    }

    /** Returns a random spawn location for a player */
    getSpawn(): any {
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
            if(!cell) continue;
            if(cell.block == null){
                return {
                    pos: pos,
                    chunk: chunk,
                };
            }
        }
    }

    // #endregion

    // #region Player

    /** Returns chunk data for an update to the given players client and handles new chunk loading as needed */
    loadPlayerChunks(player: Player): any {
        // get bottom right of chunk 2 by 2 to load
        const x = Math.floor(player.x / CHUNK_SIZE);
        const y = Math.floor(player.y / CHUNK_SIZE);
        const newChunk = { x: x, y: y };

        const returnobj: any = { chunk: newChunk };

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
        const sameChunks: Pos[] = [];
        newChunks.forEach(nc => {
            oldChunks.forEach(oc => {
                if(nc.x == oc.x && nc.y == oc.y){
                    sameChunks.push(nc);
                }
            });
        });

        // send chunk updates for same chunks
        const updatedcells: { data: any; x: number; y: number; }[] = [];
        sameChunks.forEach(sc => {
            const chunk = this.getChunk(sc.x, sc.y, false);
            if(chunk){
                chunk.cellUpdates.forEach(cellupdate => {
                    const cell = this.getCell(cellupdate.x, cellupdate.y, false);
                    if(!cell) return;

                    updatedcells.push({
                        data: cell.serializeForLoad(),
                        x: cellupdate.x,
                        y: cellupdate.y,
                    });
                });
            }
        });

        returnobj.updatedcells = updatedcells;

        if(x == player.chunk.x && y == player.chunk.y){
            // no need to load and unload chunks if already loaded
        }else{
            // compare new and old chunks to same chunks to find which ones to load and unload
            const loadChunks: Pos[] = [];
            const unloadChunks: Pos[] = [];
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
            const loadChunksSerialized: { x: number; y: number; cells: any[][]; }[] = [];
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

    /** Returns the list of chunks the given player has loaded */
    getPlayerChunks(player: Player): Pos[] {
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

    /** Saves all of the currently loaded world data to the save */
    saveWorld(): void {
        Object.values(this.loadedchunks).forEach(c => {
            this.writeChunkFile(c);
        });
    }

    // #endregion

    // #region Chunks

    /** Returns the requested chunk object if possible or null otherwise */
    getChunk(x: number, y: number, canloadnew: boolean): Chunk | null {
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            return chunk;
        }else if(x >= -WORLD_SIZE / 2 && x < WORLD_SIZE / 2 && y >= -WORLD_SIZE / 2 && y < WORLD_SIZE / 2 && canloadnew){
            // load chunk
            let newChunk = null;

            if(this.chunkFileExists(x, y)){
                const data = this.readChunkFile(x, y);
                if(!data) return null;
                newChunk = Chunk.readFromSave(x, y, data);
            }
            
            if(newChunk == null){
                newChunk = new Chunk(x, y, true);
            }
            
            this.loadedchunks[[x,y].toString()] = newChunk;

            // load entities


            // return new chunk
            return newChunk;
        }else{
            return null;
        }
    }

    /** Unloads and saves the requested chunk if it is currently loaded */
    unloadChunk(x: number, y: number): void {
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk){
            // unload chunk
            this.writeChunkFile(chunk);
            delete this.loadedchunks[[x,y].toString()];

            // unload entities
            const entities = this.game.getNonplayers().filter(e =>
                e.chunk.x == x
                && e.chunk.y == y
            );
        }
    }

    /** Returns if the requested chunks save file exists */
    chunkFileExists(x: number, y: number): boolean {
        const fileLocation = worldsavedir + [x,y].toString();

        return this.game.fileManager.fileExists(fileLocation);
    }

    /** Returns the raw data of the requested chunks save file if it exists */
    readChunkFile(x: number, y: number): any {
        const fileLocation = worldsavedir + [x,y].toString();

        return this.game.fileManager.readFile(fileLocation);
    }

    /** Saves the given chunks data */
    writeChunkFile(chunk: Chunk): void {
        const fileLocation = worldsavedir + [chunk.chunkx,chunk.chunky].toString();
        const chunkdata = chunk.serializeForWrite();

        this.game.fileManager.writeFile(fileLocation, chunkdata);
    }
    
    /** Unloads all previously loaded chunks that are not actively being loaded by a player */
    tickChunkUnloader(): void {
        const activeChunks: { x: number; y: number; }[] = [];
        this.game.getPlayerEntities().forEach((p: any) => {
            activeChunks.push(...this.getPlayerChunks(p));
        });

        Object.values(this.loadedchunks).forEach(c => {
            if(!activeChunks.find(ac => ac.x == c.chunkx && ac.y == c.chunky)){
                this.unloadChunk(c.chunkx, c.chunky);
            }
        });
    }

    /** Resets the current list of pending client cell updates */
    resetCellUpdates(): void {
        Object.values(this.loadedchunks).forEach(chunk => {
            chunk.cellUpdates = [];
        });
    }

    // #endregion

    // #region Cells

    /** Returns the requested cell if it is loaded and false otherwise */
    getCell(x: number, y: number, canloadnew: boolean): Cell | false {
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

    /** Returns the requested cell and its containing chunk if it is loaded and null otherwise */
    getCellAndChunk(x: number, y: number, canloadnew: boolean): { cell: Cell, chunk: Chunk } | null {
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);

        const cell = this.getCell(x, y, canloadnew);
        if(cell){
            return {
                cell: cell,
                chunk: this.getChunk(chunkx, chunky, false)!,
            };
        }else{
            return null;
        }
    }

    /** Tries to break the requested cell and if needed drop its corrosponding item(s) */
    breakcell(x: number, y: number, toggledrop: boolean): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(!data){
            return false;
        }
        
        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata == null){
            return false;
        }
        const { cell, chunk } = requestdata;
        if(chunk == null || cell.block == null){
            return false;
        }

        if(toggledrop){
            const droppeditem = DroppedStack.getDroppedWithSpread(x + .5, y + .5, cell.block.getDroppedStack(), .3);
            const objectsmap: any = this.game.objects;
            objectsmap[droppeditem.id] = droppeditem;
        }

        cell.block = null;

        chunk.cellUpdates.push({
            x, y
        });

        return true;
    }

    /** Tries to place the requested block in the requested cell and returns success */
    placecell(x: number, y: number, block: any): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(!data){
            return false;
        }

        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata == null){
            return false;
        }
        const { cell, chunk } = requestdata;
        if(chunk == null){
            return false;
        }
        
        cell.placeBlock(block);

        chunk.cellUpdates.push({
            x, y
        });
        return true;
    }

    /** Returns if the requested cell is empty (has no blocks or objects on it) */
    cellEmpty(x: number, y: number): boolean {
        const chunk = { x: Math.floor(x / CHUNK_SIZE), y: Math.floor(y / CHUNK_SIZE) };
        
        let empty = true;
        this.game.getAllObjects().forEach((e: GameObject) => {
            if(Math.abs(e.chunk.x - chunk.x) <= 1 && Math.abs(e.chunk.y - chunk.y) <= 1){
                if(e.tilesOn().some((t: Pos) => t.x == x && t.y == y)){
                    empty = false;
                }
            }
        });

        return empty;
    }

    // #endregion
}

export default World;