import Rectangle from "shared/physics/rectangle.js";
import { Vector2D } from "shared/types.js";

/** A uniform square in 2d space */
class Square extends Rectangle {
    constructor(position: Vector2D, width: number, rotation?: number){
        super(position, width, width, rotation);
    }
}

export default Square;
