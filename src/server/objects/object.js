const Constants = require('../../shared/constants.js');

class Object {
    constructor(id, x, y, dir){
        this.id = id;

        this.lastupdated = Date.now();

        this.x = x;
        this.y = y;
        this.dir = dir;
        this.scale = 1;
        this.asset = Constants.ASSETS.MISSING_TEXTURE; // default incase its never set

        this.falling = false;
    }

    // #region setters

    update(data){
        const deltatime = data.t - this.lastupdated;

        if(data.dir){
            this.dir = data.dir;
        }
        
        if(data.x){
            this.x = data.x;
        }else if(data.dx){
            this.x += data.dx;
        }
        if(data.y){
            this.y = data.y;
        }else if(data.dy){
            this.y += data.dy;
        }

        // get next fall scale
        if(this.falling){
            this.scale -= Constants.FALL_RATE * deltatime / 1000;
            if(this.scale <= 0){
                this.scale = 0;
                this.falling = false;
                this.onFell();
            }
        }

        this.lastupdated = data.t;
    }

    onFell(){

    }

    // #endregion

    // #region helpers

    distanceTo(object){
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    tilesOn(){
        const points = [];
        
        // get all integer coordinate points that are within object
        for(let x = Math.floor(this.x - this.scale / 2); x < this.x + this.scale / 2; x++){
            for(let y = Math.floor(this.y - this.scale / 2); y < this.y + this.scale / 2; y++){
                const p = { x: x, y: y };
                if(this.distanceTo({ x: x, y: y }) <= this.scale / 2){
                    points.push(p);
                }
            }
        }

        // start tile array
        const tiles = [{ x: Math.floor(this.x), y: Math.floor(this.y) }]; // include known center tile

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
            const tilestoadd = [
                { x: p.x, y: p.y },
                { x: p.x - 1, y: p.y },
                { x: p.x - 1, y: p.y - 1 },
                { x: p.x, y: p.y - 1 },
            ];

            tilestoadd.forEach(t => {
                if(!tiles.some(ct => ct.x == t.x && ct.y == t.y))
                    tiles.push(t);
            });
        });

        return tiles;
    }

    // #endregion

    // #region serialization

    serializeForUpdate(){
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

    // #endregion
}

module.exports = Object;