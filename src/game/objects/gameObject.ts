import crypto from "crypto";
import EventEmitter from "events";

import Logger from "../../server/logging/logger.js";
import Game from "../game.js";
import { Pos } from "../../shared/types.js";
import Entity from "./entity.js";
import Player from "./player.js";

import Constants from "../../shared/constants.js";
const { ASSETS, LOG_CATEGORIES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from "../../configs/server.js";
const { FALL_RATE } = ServerConfig.OBJECT;

/** The base class for any simulated object (something that ticks) in the game world */
abstract class GameObject {
    protected readonly logger: Logger;

    id: string;

    x: number;
    y: number;
    dx: number = 0;
    dy: number = 0;
    dir: number;
    scale: number;
    private readonly asset: string;
    falling: boolean = false;

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(x: number, y: number, dir?: number, scale?: number, asset?: string){
        this.logger = Logger.getLogger(LOG_CATEGORIES.ENTITY);

        this.id = crypto.randomUUID();

        this.x = x;
        this.y = y;
        this.dir = dir || 0;
        this.scale = scale || 1;
        this.asset = asset || ASSETS.MISSING_TEXTURE;

        this.registerListener("tick", (game: Game, dt: number) => {
            this.physicsTick(game, dt);
        });
    }

    // #region getters

    /** Returns this objects asset */
    getAsset(): string {
        return this.asset;
    }

    /** Returns the current speed of this object */
    getSpeed(): number {
        return 0;
    }

    /** Returns the current chunk of this object */
    getChunk(): Pos {
        return { x: Math.floor(this.x / CHUNK_SIZE), y: Math.floor(this.y / CHUNK_SIZE)};
    }

    // #endregion

    // #region setters

    /** Pushes the object the given distances */
    push(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    /** Sets the objects position to the given values */
    setPos(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    // #endregion

    // #region physics
    
    /** Default object collision checks */
    checkCollisions(game: Game): void {
        game.collisionManager.blockCollisions(this);
    }

    /** Check for falling */
    checkFalling(game: Game, dt: number): void {
        if(this.scale <= 0) return;
        
        if(!this.falling){
            const tilesOn = this.tilesOn();
            let notair = 0;

            tilesOn.forEach(tile => {
                const cell = game.world.getCell(tile.x, tile.y, false);
                if(cell){
                    if(cell.floor) notair++;
                }
            });

            if(notair == 0) this.falling = true;
        }else{
            this.scale -= FALL_RATE * dt;

            if(this.scale <= 0){
                this.scale = 0;
                this.falling = false;
                this.onFell(game);
            }
        }
    }

    /** Default object action after falling */
    onFell(game: Game): void {
        game.entityManager.removeObject(this.id);
    }

    /** Tries to move to target if there is one */
    physicsTick(game: Game, dt: number): void {
        this.checkFalling(game, dt);
        
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        
        if(!this.falling) this.checkCollisions(game);
    }

    // #endregion

    // #region helpers

    /** Returns the distance from this object to another object */
    distanceTo(object: Pos): number {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Returns the single cell that this object is centered on */
    getCell(): Pos {
        return {
            x: Math.floor(this.x),
            y: Math.floor(this.y),
        };
    }

    /** Returns the tiles that this object is on */
    tilesOn(): Pos[] {
        const points = [];
        const posoffset = (this.scale / 2) - .01; // offset so barely touching tiles are not counted
        
        // get all integer coordinate points that are within object
        for(let x = Math.floor(this.x - posoffset); x < this.x + posoffset; x++){
            for(let y = Math.floor(this.y - posoffset); y < this.y + posoffset; y++){
                const p = { x: x, y: y };
                if(this.distanceTo({ x: x, y: y }) <= posoffset) points.push(p);
            }
        }

        // start tile array
        const tiles: Pos[] = [{ x: Math.floor(this.x), y: Math.floor(this.y) }]; // include known center tile

        // include tiles hit by each main axis end of the object
        if(Math.floor(this.x - posoffset) != Math.floor(this.x)){
            tiles.push({ x: Math.floor(this.x - posoffset), y: Math.floor(this.y) });
        }
        if(Math.floor(this.x + posoffset) != Math.floor(this.x)){
            tiles.push({ x: Math.floor(this.x + posoffset), y: Math.floor(this.y) });
        }
        if(Math.floor(this.y - posoffset) != Math.floor(this.y)){
            tiles.push({ x: Math.floor(this.x), y: Math.floor(this.y - posoffset) });
        }
        if(Math.floor(this.y + posoffset) != Math.floor(this.y)){
            tiles.push({ x: Math.floor(this.x), y: Math.floor(this.y + posoffset) });
        }

        // get a list of the corresponding points that the points are touching
        points.forEach(p => {
            const tilestoadd: Pos[] = [
                { x: p.x, y: p.y },
                { x: p.x - 1, y: p.y },
                { x: p.x - 1, y: p.y - 1 },
                { x: p.x, y: p.y - 1 },
            ];

            tilestoadd.forEach(t => {
                if(!tiles.some(ct => ct.x == t.x && ct.y == t.y)) tiles.push(t);
            });
        });

        return tiles;
    }

    // #endregion

    // #region events

    /** Registers a listener to this objects event handler */
    private registerListener(event: string, listener: (game: Game, ...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    /** Registers a tick event listener to this objects event handler */
    registerTickListener(listener: (game: Game, dt: number) => void): void {
        this.registerListener("tick", listener);
    }

    /** Registers a death event listener to this objects event handler */
    registerDeathListener(listener: (game: Game, killedby: string, killer: any) => void): void {
        this.registerListener("death", listener);
    }

    /** Registers a collision event listener to this objects event handler */
    registerCollisionListener(listener: (game: Game, entity: Entity, push: Pos) => void): void {
        this.registerListener("collision", listener);
    }

    /** Registers an interact event listener to this objects event handler */
    registerInteractListener(listener: (game: Game, player: Player) => void): void {
        this.registerListener("interact", listener);
    }

    /** Emits an event to this objects event handler */
    protected emitEvent(event: string, game: Game, ...args: any[]): void {
        this.eventEmitter.emit(event, game, ...args);
    }

    /** Emits a tick event to this objects event handler */
    emitTickEvent(game: Game, dt: number): void {
        this.emitEvent("tick", game, dt);
    }

    /** Emits a death event to this objects event handler */
    emitDeathEvent(game: Game, killedby: string, killer: any): void {
        this.emitEvent("death", game, killedby, killer);
    }

    /** Emits a collision event to this objects event handler */
    emitCollisionEvent(game: Game, entity: Entity, push: Pos): void {
        this.emitEvent("collision", game, entity, push);
    }

    /** Emits an interact event to this objects event handler */
    emitInteractEvent(game: Game, player: Player): void {
        this.emitEvent("interact", game, player);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this objects data for a game update to the client */
    serializeForUpdate(): any {
        return {
            static: {
                id: this.id,
                asset: this.getAsset(),
                falling: this.falling,
            },
            dynamic: {
                x: this.x,
                y: this.y,
                dir: this.dir,
                scale: this.scale,
            },
        };
    }

    /** Returns an object representing this objects data for writing to the save */
    serializeForWrite(): any {
        return {
            x: this.x,
            y: this.y,
            dir: this.dir,
            scale: this.scale,
            asset: this.getAsset(),
            falling: this.falling,
        };
    }

    // #endregion
}

export default GameObject;