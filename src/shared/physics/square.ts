import { Vector2D } from "../types.js";
import Polygon from "./polygon.js";

/** A uniform square in 2d space */
class Square extends Polygon {
    halfwidth: number;

    constructor(position: Vector2D, width: number, rotation?: number){
        super(position, rotation);

        this.halfwidth = width / 2;
    }

    getVeticesFromOrigin(): Vector2D[] {
        return [
            [-this.halfwidth, -this.halfwidth],
            [this.halfwidth, -this.halfwidth],
            [this.halfwidth, this.halfwidth],
            [-this.halfwidth, this.halfwidth],
        ];
    }

    getVertexCount(): number {
        return 4;
    }
}

export default Square;
