import GameObject from "./gameObject.js";
import Game from "../game.js";
import Player from "./player.js";

import SharedConfig from "../../configs/shared.js";
const { SWING_RENDER_DELAY, HIT_RENDER_DELAY } = SharedConfig.ATTACK;

/** The base class for an entity with health loaded in the game world */
abstract class Entity extends GameObject {
    maxhealth: number;
    health: number;
    basespeed: number;
    speedmultiplier: number = 1;
    hit: boolean = false;
    hitinterval: NodeJS.Timeout | null = null;
    lasthitby: Entity | undefined = undefined;
    swinging: boolean = false;
    swinginginterval: NodeJS.Timeout | null = null;
    lastattack: number = 0;
    lastattackdir: number = 0;
    lastattackdamage: number = 0;

    constructor(x: number, y: number, maxhealth: number, dir?: number, scale?: number, asset?: string){
        super(x, y, dir, scale, asset);
        this.maxhealth = maxhealth;
        this.health = maxhealth;
        this.basespeed = 1;

        this.eventEmitter.on("death", (killedby: string, killer: any, game: Game) => {
            this.onDeath(killedby, killer, game);
        });

        this.eventEmitter.on("tick", (game: Game, dt: number) => {
            if(this.swinging) game.collisionManager.attackHitCheck(game.players[this.id], this.lastattackdir, this.lastattackdamage);
        });
    }

    /** Default entity collision checks */
    override checkCollisions(game: Game): void {
        super.checkCollisions(game);
        game.collisionManager.entityCollisions(this);
    }

    // #region getters

    /** Returns the current speed of this object */
    override getSpeed(): number {
        return this.basespeed * this.speedmultiplier;
    }

    // #endregion

    // #region setters

    /** Entity action after falling */
    override onFell(game: Game): void {
        this.eventEmitter.emit("death", "gravity", null, game);
    }

    /** Entity action after death */
    onDeath(killedby: string, killer: any, game: Game){
        if(killer instanceof Player){
            //killer.kills++;
        }
    }

    // #endregion

    // #region hit and swing

    /** Removes the given health amount from this entity and returns if it died */
    takeHit(game: Game, damage: number, attackername: string, attacker?: Entity): boolean {
        this.health -= damage;
        this.hit = true;
        this.hitinterval = setInterval(this.endHit.bind(this), 1000 * HIT_RENDER_DELAY);
        this.lasthitby = attacker;

        // tell if died
        if(this.health <= 0){
            this.eventEmitter.emit("death", attackername, attacker || null, game);
        }

        return (this.health <= 0);
    }

    /** Ends the hit animation on this entity */
    endHit(): void {
        this.hit = false;
        if(this.hitinterval != null) clearInterval(this.hitinterval);
    }

    /** Starts an attack swing for this entity */
    startSwing(dir: number, damage: number): void {
        this.swinging = true;
        this.lastattack = Date.now();
        this.lastattackdir = dir;
        this.lastattackdamage = damage;
        this.swinginginterval = setInterval(this.endSwing.bind(this), 1000 * SWING_RENDER_DELAY);
    }

    /** Ends the current attack swing if it is going on */
    endSwing(): void {
        this.swinging = false;
        if(this.swinginginterval != null) clearInterval(this.swinginginterval);
    }

    // #endregion

    // #region serialization

    /** Return an object representing this entities data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                health: this.health,
                hit: this.hit,
                swinging: this.swinging,
                lastattackdir: this.lastattackdir,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    // #endregion
}

export default Entity;