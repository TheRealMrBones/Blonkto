import Logger from "../../server/logging/logger.js";
import Game from "../game.js";
import Layer from "./layer.js";
import Player from "../objects/player.js";
import SeededRandom from "../../shared/random/seededRandom.js";

import LayerGenerator from "./generation/layerGenerator.js";
import CaveLayerGenerator from "./generation/caveLayerGenerator.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from "../../configs/server.js";
const { SEED, SPAWN_SIZE, AUTOSAVE_RATE } = ServerConfig.WORLD;
const { CHUNK_UNLOAD_RATE, DAY_LENGTH, NIGHT_LENGTH, DAY_TRANSITION_LENGTH } = ServerConfig.WORLD;

/** Manages the reading, loading, and unloading of the game world along with the loading and unloading of ticking entities inside of it */
class World {
    private readonly logger: Logger;
    
    private readonly game: Game;

    readonly seed: number;

    private readonly layers: Layer[];

    private readonly unloadInterval: NodeJS.Timeout;
    private readonly saveInterval: NodeJS.Timeout;

    private daycycletick: number;
    private darknesspercent: number = 0;
    private cycleday: boolean = true;

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.WORLD);
        this.logger.info("Initializing world");

        this.game = game;

        if(this.game.fileManager.fileExists("world")){
            const data = JSON.parse(this.game.fileManager.readFile("world")!);
            this.seed = data.seed;
            this.daycycletick = data.daycycletick;
        }else{
            this.seed = SEED == 0 ? Math.floor(Math.random() * SeededRandom.modulus) : SEED;
            this.daycycletick = DAY_TRANSITION_LENGTH;
        }
        
        this.layers = [
            new Layer(this.game, this, 0, new LayerGenerator()),
            new Layer(this.game, this, 1, new CaveLayerGenerator())
        ];

        this.saveWorld();

        this.unloadInterval = setInterval(this.tickChunkUnloader.bind(this), 1000 / CHUNK_UNLOAD_RATE);
        this.saveInterval = setInterval(this.saveWorld.bind(this), 1000 * AUTOSAVE_RATE);
    }

    // #region ticking

    /** Ticks the entire game world and returns player load data */
    tick(dt: number): {[key: string]: any } {
        // tick day cycle
        this.tickDayCycle();

        // tick all layers in this world
        for(const layer of this.layers){
            layer.tick(dt);
        }

        // get world loads for all players
        const loaddata: {[key: string]: any } = {};
        for(const p of this.game.entityManager.getPlayerEntities()){
            loaddata[p.id] = p.layer.loadPlayerChunks(p);
        }

        // cleanup chunk updates and return player loads
        for(const layer of this.layers){
            layer.resetCellUpdates();
        }
        return loaddata;
    }
    
    /** Unloads all previously loaded chunks that are not actively being loaded by a player */
    tickChunkUnloader(): void {
        // prepare active chunks array
        const activechunks: { x: number; y: number; }[][] = [];
        for(let i = 0; i < this.layers.length; i++){
            activechunks.push([]);
        }

        // get active chunks for all players
        for(const p of this.game.entityManager.getPlayerEntities()){
            activechunks[p.layer.z].push(...p.layer.getPlayerChunks(p));
        }

        // unload non-active chunks in each layer
        for(let i = 0; i < this.layers.length; i++){
            const layer = this.layers[i];
            layer.tickChunkUnloader(activechunks[i]);
        }
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

    /** Returns the current darkness percent */
    getDarknessPercent(): number {
        return this.darknesspercent;
    }

    /** Returns the if cycle day is true */
    getCycleDay(): boolean {
        return this.cycleday;
    }

    /** Sets cycle day */
    setCycleDay(val: boolean): void {
        this.cycleday = val;
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
        const layer = this.layers[0];

        for(let x = -SPAWN_SIZE / 2 - 1; x < SPAWN_SIZE / 2 + 1; x++){
            for(let y = -SPAWN_SIZE / 2 - 1; y < SPAWN_SIZE / 2 + 1; y++){
                layer.getChunk(x, y, true);
                layer.unloadChunk(x, y);
            }
        }
        
        this.logger.info("World initialized");
    }

    /** Returns a random spawn location for a player */
    getSpawn(): any {
        const layer = this.layers[0];

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
            const cell = layer.getCell(x, y, true);
            if(cell === null) continue;
            if(cell.block === null){
                return {
                    pos: pos,
                    chunk: chunk,
                    layer: layer,
                };
            }
        }
    }

    // #endregion

    // #region layers

    /** Returns the requested layer of this world or undefined if there is no layer for that z */
    getLayer(z: number): Layer | undefined {
        return this.layers[z];
    }

    // #endregion

    // #region player

    /** Returns chunk data for an update to the given players client and handles new chunk loading as needed */
    loadPlayerChunks(player: Player): any {
        return player.layer.loadPlayerChunks(player);
    }

    // #endregion

    // #region serialization

    /** Saves all of the currently loaded world data to the save */
    saveWorld(): void {
        this.logger.info("Saving world");
        
        // save global world data
        const worlddata = {
            seed: this.seed,
            daycycletick: this.daycycletick,
        };
        this.game.fileManager.writeFile("world", JSON.stringify(worlddata));

        // save all layers
        for(const layer of this.layers){
            layer.saveLayer();
        }
        
        this.logger.info("World saved");
    }

    // #endregion
}

export default World;
