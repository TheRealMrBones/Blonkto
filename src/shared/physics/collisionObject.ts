import { NumRange } from "../types.js";
import Vector2D from "./vector2d.js";

/** An physics object in 2d space that can be interfaced by the SAT collision system */
abstract class CollisionObject {
    position: Vector2D;

    constructor(position: Vector2D){
        this.position = position;
    }

    /** Returns the set of axis that should be tested between */
    abstract getSeperateAxisTheoremTestAxes(): Vector2D[];

    /** Returns the range of this collision object over the given axis */
    abstract getSeperateAxisTheoremRange(axis: Vector2D): NumRange;
}

export default CollisionObject;
