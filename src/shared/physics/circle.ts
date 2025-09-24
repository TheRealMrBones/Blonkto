import { Vector2D } from "../types.js";
import CollisionObject from "./collisionObject.js";
import V2D from "./vector2d.js";

/** A uniform circle in 2d space */
class Circle extends CollisionObject {
    readonly radius: number;

    constructor(position: Vector2D, radius: number){
        super(position);
        this.radius = radius;
    }

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return [];
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): Vector2D {
        const proj = V2D.dotProduct(axis, this.position);
        return [proj - this.radius, proj + this.radius];
    }

    /** Returns if this object has ranged minimum distance (aka a curve) */
    isRanged(): boolean {
        return true;
    }

    /** Returns the set of points to get the minimum distance point with a ranged object */
    getPointsForMinDist(): Vector2D[] {
        return [this.position];
    }
}

export default Circle;
