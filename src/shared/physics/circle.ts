import CollisionObject from "./collisionObject.js";
import Vector2D from "./vector2d.js";

/** A uniform circle in 2d space */
class Circle extends CollisionObject {
    readonly radius: number;

    constructor(position: Vector2D, radius: number){
        super(position);
        this.radius = radius;
    }

    /** Returns the closest point of this object to the given point */
    getClosestPoint(point: Vector2D): Vector2D {
        return this.position;
    }

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return [];
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): [number, number] {
        const proj = axis.dotProduct(this.position);
        return [proj + this.radius, proj - this.radius];
    }
}

export default Circle;
