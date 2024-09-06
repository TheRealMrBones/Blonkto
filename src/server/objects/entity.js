const Object = require('./object.js');
const Constants = require('../../shared/constants.js');

class Entity extends Object {
    constructor(id, x, y, dir){
        super(id, x, y, dir);
        this.scale = 1;
        this.health = 3;
        this.hit = false;
        this.hitinterval = null;
        this.killedby = "placeholder";
    }

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

    serializeForUpdate(){
        const base = super.serializeForUpdate();

        return {
            static: {
                ...(base.static),
                health: this.health,
                hit: this.hit,
            },
            dynamic: {
                ...(base.dynamic),
                scale: this.scale,
            },
        };
    }
}

module.exports = Entity;