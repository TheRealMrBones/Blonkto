import { AnchorDirection } from "shared/physics/anchorDirection.js";
import Rectangle from "shared/physics/rectangle.js";
import { Vector2D } from "shared/types.js";

/** An physics object in 2d space that can be interfaced by the SAT collision system */
abstract class CollisionObject {
    position: Vector2D;
    rotation: number;

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

    /** Returns the containing rectangle of this collision object */
    abstract getContainingRect(): Rectangle;

    /** Moves this collision object to fit its current position with the given anchor direction */
    moveForAnchor(anchordirection: AnchorDirection): void {
        const rect = this.getContainingRect();

        const halfwidth = rect.width / 2;
        const halfheight = rect.height / 2;

        this.position[0] += this.position[0] - rect.position[0];
        this.position[1] += this.position[1] - rect.position[1];

        switch(anchordirection){
            case AnchorDirection.TOP_LEFT:
                this.position = [this.position[0] + halfwidth, this.position[1] + halfheight];
                break;
            case AnchorDirection.TOP:
                this.position = [this.position[0], this.position[1] + halfheight];
                break;
            case AnchorDirection.TOP_RIGHT:
                this.position = [this.position[0] - halfwidth, this.position[1] + halfheight];
                break;
            case AnchorDirection.LEFT:
                this.position = [this.position[0] + halfwidth, this.position[1]];
                break;
            case AnchorDirection.CENTER:
                this.position = [this.position[0], this.position[1]];
                break;
            case AnchorDirection.RIGHT:
                this.position = [this.position[0] - halfwidth, this.position[1]];
                break;
            case AnchorDirection.BOTTOM_LEFT:
                this.position = [this.position[0] + halfwidth, this.position[1] - halfheight];
                break;
            case AnchorDirection.BOTTOM:
                this.position = [this.position[0], this.position[1] - halfheight];
                break;
            case AnchorDirection.BOTTOM_RIGHT:
                this.position = [this.position[0] - halfwidth, this.position[1] - halfheight];
                break;
        }
    }
}

export default CollisionObject;
