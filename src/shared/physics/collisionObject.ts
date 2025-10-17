import { Vector2D } from "../types.js";

/** An physics object in 2d space that can be interfaced by the SAT collision system */
abstract class CollisionObject {
    protected position: Vector2D;
    protected rotation: number;

    constructor(position: Vector2D, rotation?: number){
        this.position = position;
        this.rotation = rotation ?? 0;
    }

    /** Returns the set of axis that should be tested between */
    abstract getSeperateAxisTheoremTestAxes(): Vector2D[];

    /** Returns the range of this collision object over the given axis */
    abstract getSeperateAxisTheoremRange(axis: Vector2D): Vector2D;

    /** Returns if this object has ranged minimum distance (aka a curve) */
    abstract isRanged(): boolean;

    /** Returns the set of points to get the minimum distance point with a ranged object */
    abstract getPointsForMinDist(): Vector2D[];
}

export default CollisionObject;
