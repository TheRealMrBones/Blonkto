import Vector2D from "./vector2d.js";

/** An physics object in 2d space that can be interfaced by the SAT collision system */
abstract class CollisionObject {
    position: Vector2D;
    rotation: number;

    constructor(position: Vector2D, rotation?: number){
        this.position = position;
        this.rotation = rotation ?? 0;
    }

    /** Returns the closest point of this object to the given point */
    abstract getClosestPoint(point: Vector2D): Vector2D;

    /** Returns the set of axis that should be tested between */
    abstract getSeperateAxisTheoremTestAxes(): Vector2D[];

    /** Returns the range of this collision object over the given axis */
    abstract getSeperateAxisTheoremRange(axis: Vector2D): [number, number];
}

export default CollisionObject;
