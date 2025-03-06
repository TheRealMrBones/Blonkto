import crypto from "crypto";
import EventEmitter from "events";

import Game from "../game.js";
import { Pos } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

import SharedConfig from "../../configs/shared.js";
const { CHUNK_SIZE } = SharedConfig.WORLD;

import ServerConfig from "../../configs/server.js";
const { FALL_RATE } = ServerConfig.OBJECT;

/** The base class for any simulated object (something that ticks) in the game world */
class GameObject {
    id: string;
    lastupdated: number;

    x: number;
    y: number;
    chunk: Pos;
    dir: number = 0;
    scale: number = 1;
    asset: string = ASSETS.MISSING_TEXTURE;
    falling: boolean = false;

    targetpos: Pos | null = null;
    speed: number = 0;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(x: number, y: number, dir?: number, scale?: number, asset?: string){
        this.id = crypto.randomUUID();
        this.lastupdated = Date.now();

        this.x = x;
        this.y = y;
        this.chunk = { x: Math.floor(x / CHUNK_SIZE), y: Math.floor(y / CHUNK_SIZE)};
        if(dir !== undefined) this.dir = dir;
        if(scale !== undefined) this.scale = scale;
        if(asset !== undefined) this.asset = asset;

        this.eventEmitter.on("tick", (game: Game, dt: number) => {
            this.checkFalling(game, dt);
            this.moveToTarget(dt);
            this.checkCollisions(game);
        });
    }

    /** Tries to move to target if there is one */
    moveToTarget(dt: number): void {
        if(this.targetpos === null) return;
        if(this.x == this.targetpos.x && this.y == this.targetpos.y){
            this.targetpos = null;
            return;
        }

        this.dir = Math.atan2(this.targetpos.x - this.x, this.y - this.targetpos.y);
        const dist = this.distanceTo(this.targetpos);
        const movedist = this.speed * dt;

        if(dist <= movedist){
            this.x = this.targetpos.x;
            this.y = this.targetpos.y;
            this.targetpos = null;
        }else{
            this.x += Math.sin(this.dir) * movedist;
            this.y -= Math.cos(this.dir) * movedist;
        }
    }

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

    // #region ticks

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
        game.removeObject(this.id);
    }

    // #endregion

    // #region helpers

    /** Returns the distance from this object to another object */
    distanceTo(object: Pos): number {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Returns the tiles that this object is on */
    tilesOn(): Pos[]{
        const points = [];
        
        // get all integer coordinate points that are within object
        for(let x = Math.floor(this.x - this.scale / 2); x < this.x + this.scale / 2; x++){
            for(let y = Math.floor(this.y - this.scale / 2); y < this.y + this.scale / 2; y++){
                const p = { x: x, y: y };
                if(this.distanceTo({ x: x, y: y }) <= this.scale / 2) points.push(p);
            }
        }

        // start tile array
        const tiles: Pos[] = [{ x: Math.floor(this.x), y: Math.floor(this.y) }]; // include known center tile

        // include tiles hit by each main axis end of the object
        if(Math.floor(this.x - this.scale / 2) != Math.floor(this.x)){
            tiles.push({ x: Math.floor(this.x - this.scale / 2), y: Math.floor(this.y) });
        }
        if(Math.floor(this.x + this.scale / 2) != Math.floor(this.x)){
            tiles.push({ x: Math.floor(this.x + this.scale / 2), y: Math.floor(this.y) });
        }
        if(Math.floor(this.y - this.scale / 2) != Math.floor(this.y)){
            tiles.push({ x: Math.floor(this.x), y: Math.floor(this.y - this.scale / 2) });
        }
        if(Math.floor(this.y + this.scale / 2) != Math.floor(this.y)){
            tiles.push({ x: Math.floor(this.x), y: Math.floor(this.y + this.scale / 2) });
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

    // #region serialization

    /** Return an object representing this objects data for a game update to the client */
    serializeForUpdate(): any {
        return {
            static: {
                id: this.id,
                asset: this.asset,
                lastupdated: this.lastupdated,
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

    /** Return an object representing this objects data for writing to the save */
    serializeForWrite(): any {
        return {
            x: this.x,
            y: this.y,
            dir: this.dir,
            scale: this.scale,
            asset: this.asset,
            falling: this.falling,
        };
    }

    // #endregion
}

export default GameObject;