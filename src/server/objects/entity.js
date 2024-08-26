const Object = require('./object.js');

class Entity extends Object {
    constructor(id, x, y, dir){
        super(id, x, y, dir);
        this.scale = 1;
        this.health = 3;
        this.hit = false;
    }

    takeHit(damage){
        this.health -= damage;
        this.hit = true;

        // tell if died
        return (this.health <= 0);
    }

    serializeForUpdate(){
        const base = super.serializeForUpdate();

        const returnobj = {
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
        // only show hit once then client will decide how long to render as hit
        this.hit = false;

        return returnobj;
    }
}

module.exports = Entity;