class Object {
    constructor(id, x, y, dir) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.dir = dir;
    }

    setDirection(dir){
        this.dir = dir;
    }

    updateX(x){
        this.x += x;
    }

    updateY(y){
        this.y += y;
    }
  
    distanceTo(object) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
  
    serializeForUpdate() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            dir: this.dir,
        };
    }
}

module.exports = Object;