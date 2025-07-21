import GameObject from "./gameObject.js";
import Layer from "../world/layer.js";
import Game from "../game.js";

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

    godmode: boolean = false;

    constructor(layer: Layer, x: number, y: number, maxhealth: number, dir?: number, scale?: number, asset?: string){
        super(layer, x, y, dir, scale, asset);
        this.maxhealth = maxhealth;
        this.health = maxhealth;
        this.basespeed = 1;
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
        this.emitDeathEvent(game, "gravity", null);
    }

    // #endregion

    // #region events

    /** Emits a tick event to this object */
    override emitTickEvent(game: Game, dt: number): void {
        super.emitTickEvent(game, dt);

        const player = this.layer.entityManager.getPlayer(this.id)!;
        if(this.swinging) game.collisionManager.attackHitCheck(player, this.lastattackdir, this.lastattackdamage);
    }

    // #endregion

    // #region physics

    /** Default entity collision checks */
    override checkCollisions(game: Game): void {
        super.checkCollisions(game);
        game.collisionManager.entityCollisions(this);
    }

    // #endregion

    // #region attacking

    /** Removes the given health amount from this entity and returns if it died */
    takeHit(game: Game, damage: number, attackername: string, attacker?: Entity): boolean {
        if(this.godmode) return false;

        this.health -= damage;
        this.hit = true;
        this.hitinterval = setInterval(this.endHit.bind(this), 1000 * HIT_RENDER_DELAY);
        this.lasthitby = attacker;

        // tell if died
        if(this.health <= 0){
            this.emitDeathEvent(game, attackername, attacker || null);
        }

        return (this.health <= 0);
    }

    /** Ends the hit animation on this entity */
    private endHit(): void {
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
    private endSwing(): void {
        this.swinging = false;
        if(this.swinginginterval != null) clearInterval(this.swinginginterval);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this entities data for a game update to the client */
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
