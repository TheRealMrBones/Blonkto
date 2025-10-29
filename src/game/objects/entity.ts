import GameObject from "./gameObject.js";
import Layer from "../world/layer.js";
import Game from "../game.js";
import { SwingData } from "../combat/swingData.js";
import { SerializedUpdateEntity, SerializedWriteEntity } from "../../shared/serialization/objects/serializedEntity.js";

import SharedConfig from "../../configs/shared.js";
const { HIT_RENDER_DELAY } = SharedConfig.ATTACK;

/** The base class for an entity with health loaded in the game world */
abstract class Entity extends GameObject {
    protected maxhealth: number;
    protected health: number;
    protected basespeed: number;
    protected speedmultiplier: number = 1;

    private actionstart: number = 0;
    private actionend: number = 0;
    private immediateaction: boolean = false;

    private hit: boolean = false;
    private lasthitby: Entity | null = null;

    private swinging: boolean = false;
    private swingdata: SwingData | null = null;

    private godmode: boolean = false;

    constructor(layer: Layer, x: number, y: number, maxhealth: number, dir?: number, scale?: number, asset?: string){
        super(layer, x, y, dir, scale, asset);
        this.maxhealth = maxhealth;
        this.health = maxhealth;
        this.basespeed = 1;
    }

    // #region getters

    /** Returns the health of this entity */
    getHealth(): number {
        return this.health;
    }

    /** Returns if this entity is under max health */
    canHeal(): boolean {
        return (this.health < this.maxhealth);
    }

    /** Returns the current speed of this entity */
    override getSpeed(): number {
        return this.basespeed * this.speedmultiplier;
    }

    /** Returns if this entity is not currently doing an action */
    canAction(): boolean {
        const t = Date.now();
        return ((this.actionstart >= t || this.actionend <= t) && !this.immediateaction);
    }

    /** Returns if this entity is currently being hit */
    getHit(): boolean {
        return this.hit;
    }

    /** Returns the last hitter of this entity or null */
    getLastHitter(): Entity | null {
        return this.lasthitby;
    }

    // #endregion

    // #region setters

    /** Heal this entity the given amount of health */
    heal(amount: number, ignoremax?: boolean): void {
        this.health += amount;
        if(!ignoremax) this.health = Math.min(this.health, this.maxhealth);
    }

    /** Sets the speed multiplier of this entity */
    setSpeedMultiplier(speedmultiplier: number): void {
        this.speedmultiplier = speedmultiplier;
    }

    /** Sets godmode status of this entity */
    setGodmode(godmode: boolean): void {
        this.godmode = godmode;
    }

    /** Sets the start and end action to the current time + the given duration */
    setActionInterval(duration: number): void {
        const t = Date.now();

        this.actionstart = t;
        this.actionend = t + duration;
    }

    /** Sets the immediate action state of this entity */
    setImmediateAction(immediateaction: boolean): void {
        this.immediateaction = immediateaction;
    }

    // #endregion

    // #region events

    /** Emits a tick event to this object */
    override emitTickEvent(game: Game, dt: number): void {
        const player = this.layer.entityManager.getPlayer(this.id)!;
        if(this.swinging && this.swingdata !== null) game.collisionManager.attackHitCheck(player, this.swingdata);

        super.emitTickEvent(game, dt);
    }

    // #endregion

    // #region physics

    /** Default entity collision checks */
    override checkCollisions(game: Game): void {
        super.checkCollisions(game);
        game.collisionManager.entityCollisions(this);
    }

    /** Entity action after falling */
    override onFell(game: Game): void {
        this.emitDeathEvent(game, "gravity", null);
    }

    // #endregion

    // #region attacking

    /** Returns if this entity can be targeted for attacks / AI */
    isValidTarget(): boolean {
        return !this.falling;
    }

    /** Returns if this entity can be hit */
    canHit(): boolean {
        return !this.godmode && !this.falling;
    }

    /** Removes the given health amount from this entity and returns if it died */
    takeHit(game: Game, damage: number, attackername: string, attacker?: Entity): boolean {
        if(!this.canHit()) return false;

        this.health -= damage;
        this.hit = true;
        setTimeout(this.endHit.bind(this), 1000 * HIT_RENDER_DELAY);
        this.lasthitby = attacker === undefined ? null : attacker;

        // tell if died
        if(this.health <= 0){
            this.emitDeathEvent(game, attackername, attacker || null);
        }

        return (this.health <= 0);
    }

    /** Ends the hit animation on this entity */
    private endHit(): void {
        this.hit = false;
    }

    /** Starts an attack swing for this entity and returns success */
    startSwing(swingdata: SwingData): boolean {
        if(!this.canAction()) return false;

        this.swinging = true;
        this.swingdata = swingdata;

        this.setActionInterval(swingdata.actionduration);
        setTimeout(this.endSwing.bind(this), swingdata.swingduration);

        return true;
    }

    /** Ends the current attack swing if it is going on */
    private endSwing(): void {
        this.swinging = false;
        this.swingdata = null;
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this entities data for a game update to the client */
    override serializeForUpdate(): SerializedUpdateEntity {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                health: this.health,
                hit: this.hit,
                swinging: this.swinging,
                swingdir: this.swingdata === null ? 0 : this.swingdata.dir,
            },
            dynamic: {
                ...(base.dynamic),
            },
        };
    }

    /** Returns an object representing this entities data for writing to the save */
    override serializeForWrite(): SerializedWriteEntity {
        const base = super.serializeForWrite();

        return {
            ...base,
            health: this.health,
        };
    }

    // #endregion
}

export default Entity;
