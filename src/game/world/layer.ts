import Logger from "../../server/logging/logger.js";
import EntityManager from "../managers/entityManager.js";
import World from "./world.js";
import ILayerGenerator from "./generation/ILayerGenerator.js";
import ILayerSpawner from "./spawning/ILayerSpawner.js";
import Chunk from "./chunk.js";
import Cell from "./cell.js";
import DroppedStack from "../objects/droppedStack.js";
import Game from "../game.js";
import multiNumberHash from "../../shared/random/multiNumberHash.js";
import Player from "../objects/player.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import BlockRegistry from "../registries/blockRegistry.js";
import FloorRegistry from "../registries/floorRegistry.js";
import CeilingRegistry from "../registries/ceilingRegistry.js";
import V2D from "../../shared/physics/vector2d.js";
import { Vector2D } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { WORLD_SIZE, CHUNK_SIZE } = SharedConfig.WORLD;

/** Manages the reading, loading, and unloading of the game world along with the loading and unloading of ticking entities inside of it */
class Layer {
    private readonly logger: Logger;

    private readonly game: Game;
    readonly world: World;

    readonly z: number;
    readonly seed: number;

    readonly layergenerator: ILayerGenerator;
    readonly layerspawner: ILayerSpawner;

    private readonly savedir: string;
    private readonly entitysavedir: string;

    private readonly loadedchunks: Map<string, Chunk> = new Map<string, Chunk>();
    readonly light: Map<string, number> = new Map<string, number>();

    readonly entityManager: EntityManager;

    constructor(game: Game, world: World, z: number, layergenerator: ILayerGenerator, layerspawner: ILayerSpawner){
        this.logger = Logger.getLogger(LOG_CATEGORIES.WORLD);

        this.game = game;
        this.world = world;
        this.z = z;

        this.seed = multiNumberHash(this.z, this.world.seed);

        this.layergenerator = layergenerator;
        this.layerspawner = layerspawner;

        this.entityManager = new EntityManager(this.game, this.game.entityManager);
        this.game.entityManager.addChild(this.entityManager);

        // initialize save directories
        this.savedir = `world/${z}/`;
        this.entitysavedir = `${this.savedir}entities/`;

        if(!this.game.fileManager.directoryExists(this.savedir))
            this.game.fileManager.createDirectory(this.savedir);
        if(!this.game.fileManager.directoryExists(this.entitysavedir))
            this.game.fileManager.createDirectory(this.entitysavedir);
    }

    // #region ticking

    /** Ticks all loaded chunks in this layer */
    tick(dt: number): void {
        // tick cells that have tick listeners
        for(const chunk of this.loadedchunks.values()){
            chunk.tick(this.game, dt);
        }

        // tick layer spawning
        this.layerspawner.tickSpawning(this, this.game);
    }

    /** Unloads all previously loaded chunks that are not actively being loaded by a player */
    tickChunkUnloader(activechunks: Vector2D[]): void {
        for(const c of this.loadedchunks.values()){
            if(!activechunks.find(ac => ac[0] == c.chunkx && ac[1] == c.chunky))
                this.unloadChunk(c.chunkx, c.chunky);
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
        const lastchunk = player.updateLastChunk([x, y]);

        // get Vector2Ditions of new and old chunks
        const newChunks: Vector2D[] = [
            [x, y],
            [x, y - 1],
            [x, y + 1],
            [x - 1, y],
            [x - 1, y - 1],
            [x - 1, y + 1],
            [x + 1, y],
            [x + 1, y - 1],
            [x + 1, y + 1],
        ];
        const oldChunks: Vector2D[] = lastchunk === null ? [] : [
            [lastchunk[0], lastchunk[1]],
            [lastchunk[0], lastchunk[1] - 1],
            [lastchunk[0], lastchunk[1] + 1],
            [lastchunk[0] - 1, lastchunk[1]],
            [lastchunk[0] - 1, lastchunk[1] - 1],
            [lastchunk[0] - 1, lastchunk[1] + 1],
            [lastchunk[0] + 1, lastchunk[1]],
            [lastchunk[0] + 1, lastchunk[1] - 1],
            [lastchunk[0] + 1, lastchunk[1] + 1],
        ];

        // get chunks that are in both
        const sameChunks: Vector2D[] = [];
        newChunks.forEach(nc => {
            oldChunks.forEach(oc => {
                if(V2D.areEqual(nc, oc)) sameChunks.push(nc);
            });
        });

        // send chunk updates for same chunks
        const updatedcells: { data: any; x: number; y: number; }[] = [];
        sameChunks.forEach(sc => {
            const chunk = this.getChunk(sc[0], sc[1], false);
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
        const loadChunks: Vector2D[] = [];
        const unloadChunks: Vector2D[] = [];

        newChunks.forEach(nc => {
            let isNew = true;
            sameChunks.forEach(sc => {
                if(V2D.areEqual(nc, sc)) isNew = false;
            });
            if(isNew) loadChunks.push(nc);
        });
        oldChunks.forEach(oc => {
            let isOld = true;
            sameChunks.forEach(sc => {
                if(V2D.areEqual(oc, sc)) isOld = false;
            });
            if(isOld) unloadChunks.push(oc);
        });

        // load chunks
        const loadChunksSerialized: { x: number; y: number; cells: any[][]; }[] = [];

        loadChunks.forEach(lc => {
            const chunk = this.getChunk(lc[0], lc[1], true);
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
    getPlayerChunks(player: Player): Vector2D[] {
        const playerchunk = player.getChunk();

        return [
            [playerchunk[0], playerchunk[1]],
            [playerchunk[0], playerchunk[1] - 1],
            [playerchunk[0], playerchunk[1] + 1],
            [playerchunk[0] - 1, playerchunk[1]],
            [playerchunk[0] - 1, playerchunk[1] - 1],
            [playerchunk[0] - 1, playerchunk[1] + 1],
            [playerchunk[0] + 1, playerchunk[1]],
            [playerchunk[0] + 1, playerchunk[1] - 1],
            [playerchunk[0] + 1, playerchunk[1] + 1],
        ];
    }

    // #endregion

    // #region Chunks

    /** Returns the requested chunk object if Vector2Dsible or null otherwise */
    getChunk(x: number, y: number, canloadnew: boolean): Chunk | null {
        const chunkkey = Layer.getChunkKey(x, y);
        const chunk = this.loadedchunks.get(chunkkey);

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
        const chunkkey = Layer.getChunkKey(x, y);
        const chunk = this.loadedchunks.get(chunkkey);

        if(chunk !== undefined){
            // unload chunk
            chunk.unload(this.game);
            this.writeChunkFile(chunk);
            this.loadedchunks.delete(chunkkey);

            // unload entities
            EntityManager.filterToChunk([x, y], [...this.entityManager.getNonplayers()]).forEach(e => {
                this.game.entityManager.removeNonplayer(e.id);
            });
        }
    }

    /** Returns if the requested chunks save file exists */
    chunkFileExists(x: number, y: number): boolean {
        const fileLocation = this.savedir + [x,y].toString();

        return this.game.fileManager.fileExists(fileLocation);
    }

    /** Returns the chunk object or null otherwise */
    loadChunk(x: number, y: number): Chunk | null {
        const chunkfilelocation = this.savedir + [x,y].toString();
        const entitiesfilelocation = this.entitysavedir + [x,y].toString();

        // read chunk data
        const data = this.game.fileManager.readFile(chunkfilelocation);
        if(data === null) return null;
        const chunk = Chunk.readFromSave(this, x, y, data, this.game);
        if(chunk === null){
            this.logger.error(`Chunk ${x},${y} failed to load. File may have been corrupted`);
            return this.generateChunk(x, y);
        }
        this.loadedchunks.set(Layer.getChunkKey(x, y), chunk);

        // load entities
        if(this.game.fileManager.fileExists(entitiesfilelocation)){
            const entitiesdata = JSON.parse(this.game.fileManager.readFile(entitiesfilelocation) || "[]");
            for(const entitydata of entitiesdata){
                switch(entitydata.type){
                    case "dropped_stack": {
                        const droppedstack = DroppedStack.readFromSave(this, entitydata);
                        this.entityManager.addObject(droppedstack);
                        break;
                    }
                    case "entity": {
                        const entity = NonplayerEntity.readFromSave(this, entitydata);
                        this.entityManager.addEntity(entity);
                        break;
                    }
                    default: {
                        console.log(`Unknown entity type ${entitydata.type} read from save in chunk ${x},${y}`);
                    }
                }
            }

            // spawn new entities if there are too few
            this.layerspawner.repopulateChunk(chunk, this.game, entitiesdata);
        }

        // finally return the chunk
        return chunk;
    }

    /** Saves the given chunks data */
    writeChunkFile(chunk: Chunk): void {
        const chunkfilelocation = this.savedir + [chunk.chunkx,chunk.chunky].toString();
        const entitiesfilelocation = this.entitysavedir + [chunk.chunkx,chunk.chunky].toString();

        const chunkdata = chunk.serializeForWrite();
        this.game.fileManager.writeFile(chunkfilelocation, chunkdata);

        // save entities (and objects) seperately
        const entities = EntityManager.filterToChunk([chunk.chunkx, chunk.chunky], [...this.entityManager.getNonplayers()]);

        const entitiesdata = JSON.stringify(entities.map(e => e.serializeForWrite()));
        this.game.fileManager.writeFile(entitiesfilelocation, entitiesdata);
    }

    /** Returns a new generated chunk */
    generateChunk(x: number, y: number): Chunk {
        const newchunk = this.layergenerator.generateChunk(this, x, y, this.game);
        this.loadedchunks.set(Layer.getChunkKey(x, y), newchunk);

        this.layerspawner.populateChunk(newchunk, this.game);

        return newchunk;
    }

    /** Resets the current list of pending client cell updates */
    resetCellUpdates(): void {
        for(const c of this.loadedchunks.values()){
            c.cellupdates = [];
        }
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

    /** Returns if the requested cell is empty (has no blocks or objects on it) */
    cellEmpty(x: number, y: number): boolean {
        const chunk = { x: Math.floor(x / CHUNK_SIZE), y: Math.floor(y / CHUNK_SIZE) };

        let empty = true;
        for(const e of this.entityManager.getAllObjects()){
            if(Math.abs(e.getChunk()[0] - chunk.x) <= 1 && Math.abs(e.getChunk()[1] - chunk.y) <= 1){
                if(e.tilesOn().some((t: Vector2D) => t[0] == x && t[1] == y)) empty = false;
            }
        }

        return empty;
    }

    // #endregion

    // #region helpers

    /** Returns the key of the given chunk based on its x and y */
    static getChunkKey(x: number, y: number): string {
        return [x,y].toString();
    }

    // #endregin

    // #region serialization

    /** Saves all of the currently loaded world data to the save */
    saveLayer(): void {
        for(const c of this.loadedchunks.values()){
            this.writeChunkFile(c);
        }
    }

    // #endregion
}

export default Layer;
