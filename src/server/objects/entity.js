const Object = require('./object.js');
const Constants = require('../../shared/constants.js');

class Entity extends Object {
    constructor(id, x, y, dir){
        super(id, x, y, dir);
        this.health = 10;

        this.chunk = { x: Math.floor(x / Constants.CHUNK_SIZE), y: Math.floor(y / Constants.CHUNK_SIZE)}; // purposefully make chunk off so that new update has load data

        this.hit = false;
        this.hitinterval = null;
        this.swinging = false;
        this.swinginginterval = null;

        this.lastattack = 0;
        this.lastattackdir = 0;
        
        this.dead = false;
        this.killedby = "placeholder";
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

    takeHit(damage){
        this.health -= damage;
        this.hit = true;
        this.hitinterval = setInterval(this.endHit.bind(this), 1000 * Constants.HIT_RENDER_DELAY);

        // tell if died
        return (this.health <= 0);
    }

    endHit(){
        this.hit = false;
        clearInterval(this.hitinterval);
    }

    startSwing(){
        this.swinging = true;
        this.swinginginterval = setInterval(this.endSwing.bind(this), 1000 * Constants.SWING_RENDER_DELAY);
    }

    endSwing(){
        this.swinging = false;
        clearInterval(this.swinginginterval);
    }

    // #endregion

    // #region serialization

    serializeForUpdate(){
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

module.exports = Entity;