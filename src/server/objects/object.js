const Constants = require('../../shared/constants.js');

class Object {
    constructor(id, x, y, dir){
        this.id = id;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.scale = 1;
        this.asset = Constants.ASSETS.MISSING_TEXTURE; // default incase its never set
    }

    // #region setters

    setDirection(dir){
        this.dir = dir;
    }

    updateX(x){
        this.x += x;
    }

    updateY(y){
        this.y += y;
    }

    // #endregion

    // #region helpers

    distanceTo(object){
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // #endregion

    // #region serialization

    serializeForUpdate(){
        return {
            static: {
                id: this.id,
                asset: this.asset,
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