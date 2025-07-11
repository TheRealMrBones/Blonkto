import Logger from "../../server/logging/logger.js";
import Chunk from "./chunk.js";
import Cell from "./cell.js";
import DroppedStack from "../objects/droppedStack.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import GameObject from "../objects/gameObject.js"; 
import NonplayerEntity from "../objects/nonplayerEntity.js";
import BlockRegistry from "../registries/blockRegistry.js";
import FloorRegistry from "../registries/floorRegistry.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import { Pos } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { WORLD_SIZE, CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from "../../configs/server.js";
const { SPAWN_SIZE, AUTOSAVE_RATE } = ServerConfig.WORLD;
const { CHUNK_UNLOAD_RATE, DAY_LENGTH, NIGHT_LENGTH, DAY_TRANSITION_LENGTH } = ServerConfig.WORLD;

const worldsavedir = "world/";
const entitiessavedir = "entities/";

/** Manages the reading, loading, and unloading of the game world along with the loading and unloading of ticking entities inside of it */
class World {
    private readonly logger: Logger;
    
    private game: Game;
    loadedchunks: {[key: string]: Chunk};
    light: {[key: string]: number} = {};

    unloadInterval: NodeJS.Timeout;
    saveInterval: NodeJS.Timeout;

    private daycycletick: number = DAY_TRANSITION_LENGTH;
    darknesspercent: number = 0;
    cycleday: boolean = true;

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.WORLD);
        this.logger.info("Initializing world");

        this.game = game;

        // key for each chunk is [x,y].toString()
        this.loadedchunks = {};

        this.unloadInterval = setInterval(this.tickChunkUnloader.bind(this), 1000 / CHUNK_UNLOAD_RATE);
        this.saveInterval = setInterval(this.saveWorld.bind(this), 1000 * AUTOSAVE_RATE);
        
        this.logger.info("World initialized");
    }

    // #region ticking

    /** Ticks the entire game world */
    tick(dt: number): {[key: string]: any } {
        // tick day cycle
        this.tickDayCycle();

        // tick cells that have tick listeners
        for(const chunk of Object.values(this.loadedchunks)){
            for(const row of chunk.cells){
                for(const cell of row){
                    if(cell.ticks){
                        if(cell.block !== null) cell.block.emitTickEvent(this.game, dt);
                        if(cell.floor !== null) cell.floor.emitTickEvent(this.game, dt);
                        if(cell.ceiling !== null) cell.ceiling.emitTickEvent(this.game, dt);
                    }
                }
            }
        }

        // get world loads for players
        const worldloads: {[key: string]: any } = {};
        this.game.entityManager.getPlayerEntities().forEach(p => {
            const worldload = this.loadPlayerChunks(p);
            worldloads[p.id] = worldload;
        });

        // cleanup chunk updates and return loads
        this.resetCellUpdates();
        return worldloads;
    }

    // #endregion

    // #region Time

    /** Ticks the day cycle */
    tickDayCycle(): void {
        if(!this.cycleday) return;

        this.setDayTick(this.daycycletick + 1);
    }

    /** Sets the day tick to the new value */
    setDayTick(val: number): void {
        this.daycycletick = val;
        if(this.daycycletick > DAY_LENGTH + NIGHT_LENGTH) this.daycycletick = 0;

        if(this.isNight()){
            // night
            const timetime = this.daycycletick - DAY_LENGTH;

            if(timetime >= DAY_TRANSITION_LENGTH){
                this.darknesspercent = 1;
            }else{
                this.darknesspercent = timetime / DAY_TRANSITION_LENGTH;
            }
        }else{
            // day
            const timetime = this.daycycletick;

            if(timetime >= DAY_TRANSITION_LENGTH){
                this.darknesspercent = 0;
            }else{
                this.darknesspercent = (1 - timetime / DAY_TRANSITION_LENGTH);
            }
        }
    }

    /** Returns the current day tick */
    getDayTick(): number {
        return this.daycycletick;
    }

    /** Returns if it is night or not */
    isNight(): boolean {
        return (this.daycycletick > DAY_LENGTH);
    }

    /** Returns if it is night or not */
    isDay(): boolean {
        return !this.isNight();
    }

    // #endregion

    // #region Spawn

    /** Pregenerates the spawn region of the world if needed */
    generateSpawn(): void {
        for(let x = -SPAWN_SIZE / 2 - 1; x < SPAWN_SIZE / 2 + 1; x++){
            for(let y = -SPAWN_SIZE / 2 - 1; y < SPAWN_SIZE / 2 + 1; y++){
                this.getChunk(x, y, true);
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
            if(cell === null) continue;
            if(cell.block === null){
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
        // prepare used lists
        const usedblocks: string[] = [];
        const usedfloors: string[] = [];
        const usedceilings: string[] = [];
        const usedblocksserialized: any[] = [];
        const usedfloorsserialized: any[] = [];
        const usedceilingsserialized: any[] = [];

        // get bottom right of chunk 2 by 2 to load
        const x = Math.floor(player.x / CHUNK_SIZE);
        const y = Math.floor(player.y / CHUNK_SIZE);
        const lastchunk = player.lastchunk;
        player.lastchunk = { x: x, y: y };

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
        const oldChunks = lastchunk === undefined ? [] : [
            { x: lastchunk.x, y: lastchunk.y},
            { x: lastchunk.x, y: lastchunk.y - 1},
            { x: lastchunk.x, y: lastchunk.y + 1},
            { x: lastchunk.x - 1, y: lastchunk.y},
            { x: lastchunk.x - 1, y: lastchunk.y - 1},
            { x: lastchunk.x - 1, y: lastchunk.y + 1},
            { x: lastchunk.x + 1, y: lastchunk.y},
            { x: lastchunk.x + 1, y: lastchunk.y - 1},
            { x: lastchunk.x + 1, y: lastchunk.y + 1},
        ];

        // get chunks that are in both
        const sameChunks: Pos[] = [];
        newChunks.forEach(nc => {
            oldChunks.forEach(oc => {
                if(nc.x == oc.x && nc.y == oc.y) sameChunks.push(nc);
            });
        });

        // send chunk updates for same chunks
        const updatedcells: { data: any; x: number; y: number; }[] = [];
        sameChunks.forEach(sc => {
            const chunk = this.getChunk(sc.x, sc.y, false);
            if(chunk !== null){
                chunk.cellupdates.forEach(cellupdate => {
                    const cell = this.getCell(cellupdate.x, cellupdate.y, false);
                    if(cell === null) return;
                    const cellserialized = cell.serializeForLoad();

                    updatedcells.push({
                        data: cellserialized,
                        x: cellupdate.x,
                        y: cellupdate.y,
                    });

                    if(cellserialized.block) if(!usedblocks.includes(cellserialized.block))
                        usedblocks.push(cellserialized.block);
                    if(cellserialized.floor) if(!usedfloors.includes(cellserialized.floor))
                        usedfloors.push(cellserialized.floor);
                    if(cellserialized.ceiling) if(!usedceilings.includes(cellserialized.ceiling))
                        usedceilings.push(cellserialized.ceiling);
                });
            }
        });

        // compare new and old chunks to same chunks to find which ones to load and unload
        const loadChunks: Pos[] = [];
        const unloadChunks: Pos[] = [];

        newChunks.forEach(nc => {
            let isNew = true;
            sameChunks.forEach(sc => {
                if(nc.x == sc.x && nc.y == sc.y) isNew = false;
            });
            if(isNew) loadChunks.push(nc);
        });
        oldChunks.forEach(oc => {
            let isOld = true;
            sameChunks.forEach(sc => {
                if(oc.x == sc.x && oc.y == sc.y) isOld = false;
            });
            if(isOld) unloadChunks.push(oc);
        });

        // load chunks
        const loadChunksSerialized: { x: number; y: number; cells: any[][]; }[] = [];

        loadChunks.forEach(lc => {
            const chunk = this.getChunk(lc.x, lc.y, true);
            if(chunk !== null){
                const serializedchunk = chunk.serializeForLoad();
                loadChunksSerialized.push(serializedchunk);

                for(const usedblock of serializedchunk.usedblocks){
                    if(!usedblocks.includes(usedblock))
                        usedblocks.push(usedblock);
                }
                for(const usedfloor of serializedchunk.usedfloors){
                    if(!usedfloors.includes(usedfloor))
                        usedfloors.push(usedfloor);
                }
                for(const usedceiling of serializedchunk.usedceilings){
                    if(!usedceilings.includes(usedceiling))
                        usedceilings.push(usedceiling);
                }
            }
        });

        // serialize used definitions
        for(const usedblock of usedblocks){
            usedblocksserialized.push(BlockRegistry.get(usedblock).serializeForInit());
        }
        for(const usedfloor of usedfloors){
            usedfloorsserialized.push(FloorRegistry.get(usedfloor).serializeForInit());
        }
        for(const usedceiling of usedceilings){
            usedceilingsserialized.push(CeilingRegistry.get(usedceiling).serializeForInit());
        }

        // return final data
        return {
            updatedcells: updatedcells,
            unloadChunks: unloadChunks,
            loadChunks: loadChunksSerialized,
            usedblocks: usedblocksserialized,
            usedfloors: usedfloorsserialized,
            usedceilings: usedceilingsserialized,
        };
    }

    /** Returns the list of chunks the given player has loaded */
    getPlayerChunks(player: Player): Pos[] {
        const playerchunk = player.getChunk();

        return [
            { x: playerchunk.x, y: playerchunk.y},
            { x: playerchunk.x, y: playerchunk.y - 1},
            { x: playerchunk.x, y: playerchunk.y + 1},
            { x: playerchunk.x - 1, y: playerchunk.y},
            { x: playerchunk.x - 1, y: playerchunk.y - 1},
            { x: playerchunk.x - 1, y: playerchunk.y + 1},
            { x: playerchunk.x + 1, y: playerchunk.y},
            { x: playerchunk.x + 1, y: playerchunk.y - 1},
            { x: playerchunk.x + 1, y: playerchunk.y + 1},
        ];
    }

    // #endregion

    // #region World

    /** Saves all of the currently loaded world data to the save */
    saveWorld(): void {
        this.logger.info("Saving world");
        Object.values(this.loadedchunks).forEach(c => {
            this.writeChunkFile(c);
        });
        this.logger.info("World saved");
    }

    // #endregion

    // #region Chunks

    /** Returns the requested chunk object if possible or null otherwise */
    getChunk(x: number, y: number, canloadnew: boolean): Chunk | null {
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk !== undefined){
            return chunk;
        }else if(x >= -WORLD_SIZE / 2 && x < WORLD_SIZE / 2 && y >= -WORLD_SIZE / 2 && y < WORLD_SIZE / 2 && canloadnew){
            // load chunk
            if(this.chunkFileExists(x, y)){
                const loadedchunk = this.loadChunk(x, y);
                if(loadedchunk !== null) return loadedchunk;
            }
            
            // if no loaded chunk then generate a new chunk
            return this.generateChunk(x, y);
        }else{
            return null;
        }
    }

    /** Unloads and saves the requested chunk if it is currently loaded */
    unloadChunk(x: number, y: number): void {
        const chunk = this.loadedchunks[[x,y].toString()];
        if(chunk !== undefined){
            // unload chunk
            chunk.unload(this.game);
            this.writeChunkFile(chunk);
            delete this.loadedchunks[[x,y].toString()];

            // unload entities
            const entities = this.game.entityManager.getNonplayers().filter(e =>
                e.getChunk().x == x
                && e.getChunk().y == y
            ).forEach(e => {
                this.game.entityManager.removeNonplayer(e.id);
            });
        }
    }

    /** Returns if the requested chunks save file exists */
    chunkFileExists(x: number, y: number): boolean {
        const fileLocation = worldsavedir + [x,y].toString();

        return this.game.fileManager.fileExists(fileLocation);
    }

    /** Returns the chunk object or null otherwise */
    loadChunk(x: number, y: number): Chunk | null {
        const chunkfilelocation = worldsavedir + [x,y].toString();
        const entitiesfilelocation = entitiessavedir + [x,y].toString();

        // read chunk data
        const data = this.game.fileManager.readFile(chunkfilelocation);
        if(data === null) return null;
        const chunk = Chunk.readFromSave(x, y, data, this.game);
        if(chunk === null){
            this.logger.error(`Chunk ${x},${y} failed to load. File may have been corrupted`);
            return this.generateChunk(x, y);
        }
        this.loadedchunks[[x,y].toString()] = chunk;

        // load entities
        if(this.game.fileManager.fileExists(entitiesfilelocation)){
            const entitiesdata = JSON.parse(this.game.fileManager.readFile(entitiesfilelocation) || "[]");
            for(const entitydata of entitiesdata){
                switch(entitydata.type){
                    case "dropped_stack": {
                        const droppedstack = DroppedStack.readFromSave(entitydata);
                        this.game.objects[droppedstack.id] = droppedstack;
                        break;
                    }
                    case "entity": {
                        const entity = NonplayerEntity.readFromSave(entitydata);
                        this.game.entities[entity.id] = entity;
                        break;
                    }
                    default: {
                        console.log(`Unknown entity type ${entitydata.type} read from save in chunk ${x},${y}`);
                    }
                }
            }

            // spawn new entities if there are too few
            const minentities = 1;
            for(let i = minentities - entitiesdata.filter((e: any) => e.type == "entity").length; i > 0; i--){
                const cellx = x * CHUNK_SIZE + Math.floor(Math.random() * CHUNK_SIZE);
                const celly = y * CHUNK_SIZE + Math.floor(Math.random() * CHUNK_SIZE);

                const cell = this.getCell(cellx, celly, false);
                if(cell === null) continue;
                if(cell.block != null) continue;

                const pig = new NonplayerEntity(cellx + .5, celly + .5, 0, "pig");
                this.game.entities[pig.id] = pig;
            }
        }

        // finally return the chunk
        return chunk;
    }

    /** Saves the given chunks data */
    writeChunkFile(chunk: Chunk): void {
        const chunkfilelocation = worldsavedir + [chunk.chunkx,chunk.chunky].toString();
        const entitiesfilelocation = entitiessavedir + [chunk.chunkx,chunk.chunky].toString();

        const chunkdata = chunk.serializeForWrite();
        this.game.fileManager.writeFile(chunkfilelocation, chunkdata);

        // save entities (and objects) seperately
        const entities = this.game.entityManager.getNonplayers().filter(o =>
            o.getChunk().x == chunk.chunkx &&
            o.getChunk().y == chunk.chunky
        );

        const entitiesdata = JSON.stringify(entities.map(e => e.serializeForWrite()));
        this.game.fileManager.writeFile(entitiesfilelocation, entitiesdata);
    }

    /** Returns a new generated chunk */
    generateChunk(x: number, y: number): Chunk {
        const newChunk = Chunk.generateChunk(x, y, this.game);
        this.loadedchunks[[x,y].toString()] = newChunk;
        return newChunk;
    }
    
    /** Unloads all previously loaded chunks that are not actively being loaded by a player */
    tickChunkUnloader(): void {
        const activeChunks: { x: number; y: number; }[] = [];
        this.game.entityManager.getPlayerEntities().forEach((p: any) => {
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
            chunk.cellupdates = [];
        });
    }

    // #endregion

    // #region Cells

    /** Returns the requested cell if it is loaded and false otherwise */
    getCell(x: number, y: number, canloadnew: boolean): Cell | null {
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);
        const cellx = x - chunkx * CHUNK_SIZE;
        const celly = y - chunky * CHUNK_SIZE;
    
        const chunk = this.getChunk(chunkx, chunky, canloadnew);
        return chunk ? chunk.cells[cellx][celly] : null;
    }

    /** Returns the requested cell and its containing chunk if it is loaded and null otherwise */
    getCellAndChunk(x: number, y: number, canloadnew: boolean): { cell: Cell, chunk: Chunk } | null {
        const chunkx = Math.floor(x / CHUNK_SIZE);
        const chunky = Math.floor(y / CHUNK_SIZE);

        const cell = this.getCell(x, y, canloadnew);
        if(cell !== null){
            return {
                cell: cell,
                chunk: this.getChunk(chunkx, chunky, false)!,
            };
        }else{
            return null;
        }
    }

    /** Sets the block at the requested postion to the requested value */
    setBlock(x: number, y: number, block: string | null): void {
        const requestdata = this.getCellAndChunk(x, y, true);
        if(requestdata === null) return;
        const { cell, chunk } = requestdata;
        if(chunk === null) return;

        cell.setBlock(block, this.game);
        chunk.cellupdates.push({
            x, y
        });
    }

    /** Tries to break the requested block and returns success */
    breakBlock(x: number, y: number, toggledrop: boolean): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(data === null) return false;
        
        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata === null) return false;
        const { cell, chunk } = requestdata;
        if(chunk === null || cell.block === null) return false;

        const response = cell.breakBlock(x, y, toggledrop, this.game);
        chunk.cellupdates.push({
            x, y
        });
        return response;
    }

    /** Tries to place the requested block in the requested cell and returns success */
    placeBlock(x: number, y: number, block: any): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(data === null) return false;

        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata === null) return false;
        const { cell, chunk } = requestdata;
        if(chunk === null) return false;
        
        const response = cell.placeBlock(block, this.game);
        chunk.cellupdates.push({
            x, y
        });
        return response;
    }

    /** Sets the floor at the requested postion to the requested value */
    setFloor(x: number, y: number, floor: string | null): void {
        const requestdata = this.getCellAndChunk(x, y, true);
        if(requestdata === null) return;
        const { cell, chunk } = requestdata;
        if(chunk === null) return;

        cell.setFloor(floor, this.game);
        chunk.cellupdates.push({
            x, y
        });
    }

    /** Tries to break the requested floor and returns success */
    breakFloor(x: number, y: number, toggledrop: boolean): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(data === null) return false;
        
        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata === null) return false;
        const { cell, chunk } = requestdata;
        if(chunk === null || cell.floor === null) return false;
        if(cell.basefloor !== null) if(cell.floor.definition.getRegistryKey() === cell.basefloor.getRegistryKey()) return false;

        const response = cell.breakFloor(x, y, toggledrop, this.game);
        chunk.cellupdates.push({
            x, y
        });
        return response;
    }

    /** Tries to place the requested floor in the requested cell and returns success */
    placeFloor(x: number, y: number, floor: any): boolean {
        const data = this.getCellAndChunk(x, y, false);
        if(data === null) return false;

        const requestdata = this.getCellAndChunk(x, y, false);
        if(requestdata === null) return false;
        const { cell, chunk } = requestdata;
        if(chunk === null) return false;
        
        const response = cell.placeFloor(floor, this.game);
        chunk.cellupdates.push({
            x, y
        });
        return response;
    }

    /** Sets the base floor at the requested postion to the requested value */
    setBaseFloor(x: number, y: number, floor: string | null): void {
        const requestdata = this.getCellAndChunk(x, y, true);
        if(requestdata === null) return;
        const { cell, chunk } = requestdata;
        if(chunk === null) return;

        cell.setBaseFloor(floor, this.game);
        chunk.cellupdates.push({
            x, y
        });
    }

    /** Returns if the requested cell is empty (has no blocks or objects on it) */
    cellEmpty(x: number, y: number, ignoreobjects?: boolean): boolean {
        const chunk = { x: Math.floor(x / CHUNK_SIZE), y: Math.floor(y / CHUNK_SIZE) };
        
        let empty = true;
        this.game.entityManager.getAllObjects().forEach((e: GameObject) => {
            if(Math.abs(e.getChunk().x - chunk.x) <= 1 && Math.abs(e.getChunk().y - chunk.y) <= 1){
                if(e.tilesOn().some((t: Pos) => t.x == x && t.y == y)) empty = false;
            }
        });

        return empty;
    }

    // #endregion
}

export default World;