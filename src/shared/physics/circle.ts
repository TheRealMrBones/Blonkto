import CollisionObject from "shared/physics/collisionObject.js";
import Rectangle from "shared/physics/rectangle.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** A uniform circle in 2d space */
class Circle extends CollisionObject {
    private readonly radius: number;

    constructor(position: Vector2D, radius: number){
        super(position);
        this.radius = radius;
    }

    // #region SAT

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return [];
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): Vector2D {
        const proj = V2D.dotProduct(axis, this.getPosition());
        return [proj - this.radius, proj + this.radius];
    }

    /** Returns if this object has ranged minimum distance (aka a curve) */
    isRanged(): boolean {
        return true;
    }

    /** Returns the set of points to get the minimum distance point with a ranged object */
    getPointsForMinDist(): Vector2D[] {
        return [this.getPosition()];
    }

    // #endregion

    // #region helper

    /** Returns the containing rectangle of this collision object */
    getContainingRect(): Rectangle {
        const position = this.getPosition();
        return new Rectangle([position[0], position[1]], this.radius * 2, this.radius * 2);
    }

    // #endregion
}

export default Circle;
