import GameObject from "./gameObject.js";

import SharedConfig from "../../configs/shared.js";
const { SWING_RENDER_DELAY, HIT_RENDER_DELAY } = SharedConfig.ATTACK;

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

    onFell(){
        setTimeout(() => {
            this.dead = true;
            this.killedby = "gravity";
        }, 1000);
    }

    // #endregion

    // #region hit and swing

    takeHit(damage: number){
        this.health -= damage;
        this.hit = true;
        this.hitinterval = setInterval(this.endHit.bind(this), 1000 * HIT_RENDER_DELAY);

        // tell if died
        return (this.health <= 0);
    }

    endHit(){
        this.hit = false;
        if(this.hitinterval != null) clearInterval(this.hitinterval);
    }

    startSwing(){
        this.swinging = true;
        this.swinginginterval = setInterval(this.endSwing.bind(this), 1000 * SWING_RENDER_DELAY);
    }

    endSwing(){
        this.swinging = false;
        if(this.swinginginterval != null) clearInterval(this.swinginginterval);
    }

    // #endregion

    // #region serialization

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