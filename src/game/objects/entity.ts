import GameObject from "./gameObject.js";
import Game from "../game.js";

import SharedConfig from "../../configs/shared.js";
const { SWING_RENDER_DELAY, HIT_RENDER_DELAY } = SharedConfig.ATTACK;

/** The base class for an entity with health loaded in the game world */
class Entity extends GameObject {
    maxhealth: number;
    health: number;
    hit: boolean = false;
    hitinterval: NodeJS.Timeout | null = null;
    swinging: boolean = false;
    swinginginterval: NodeJS.Timeout | null = null;
    lastattack: number = 0;
    lastattackdir: number = 0;
    dead: boolean = false;
    killedby: string = "placeholder";

    constructor(x: number, y: number, maxhealth: number, dir?: number, scale?: number, asset?: string){
        super(x, y, dir, scale, asset);
        this.maxhealth = maxhealth;
        this.health = maxhealth;
    }

    // #region setters

    /** Entity action after falling */
    override onFell(game: Game): void {
        this.dead = true;
        this.killedby = "gravity";
    }

    // #endregion

    // #region hit and swing

    /** Removes the given health amount from this entity and returns if it died */
    takeHit(damage: number): boolean {
        this.health -= damage;
        this.hit = true;
        this.hitinterval = setInterval(this.endHit.bind(this), 1000 * HIT_RENDER_DELAY);

        // tell if died
        return (this.health <= 0);
    }

    /** Ends the hit animation on this entity */
    endHit(): void {
        this.hit = false;
        if(this.hitinterval != null) clearInterval(this.hitinterval);
    }

    /** Starts an attack swing for this entity */
    startSwing(dir: number): void {
        this.swinging = true;
        this.lastattack = Date.now();
        this.lastattackdir = dir;
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
    serializeForUpdate(): any {
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