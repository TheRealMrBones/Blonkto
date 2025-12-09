import { AnchorDirection } from "shared/physics/anchorDirection.js";
import Rectangle from "shared/physics/rectangle.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** A physics object in 2d space that can be interfaced by the SAT collision system */
abstract class CollisionObject {
    private position: Vector2D = [0, 0];
    private rotation: number = 0;

    constructor(position: Vector2D, rotation?: number){
        this.setPosition(position);
        if(rotation !== undefined) this.setRotation(rotation);
    }

    // #region getters

    /** Returns the position of this collision object */
    getPosition(): Vector2D {
        return this.position;
    }

    /** Returns the rotation of this collision object */
    getRotation(): number {
        return this.rotation;
    }

    /** Returns the composite collision objects of this collision object if any */
    getCompositeObjects(): CollisionObject[] {
        return [];
    }

    // #endregion

    // #region setters

    /** Sets the position of this collision object */
    setPosition(position: Vector2D): void {
        this.position = position;
    }

    /** Moves the position of this collision object the given amounts */
    movePosition(move: Vector2D): void {
        this.setPosition(V2D.add(this.position, move));
    }

    /** Sets the rotation of this collision object */
    setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    // #endregion

    // #region SAT

    /** Returns the set of axis that should be tested between */
    abstract getSeperateAxisTheoremTestAxes(): Vector2D[];

    /** Returns the range of this collision object over the given axis */
    abstract getSeperateAxisTheoremRange(axis: Vector2D): Vector2D;

    /** Returns if this object has ranged minimum distance (aka a curve) */
    abstract isRanged(): boolean;

    /** Returns the set of points to get the minimum distance point with a ranged object */
    abstract getPointsForMinDist(): Vector2D[];

    // #endregion

    // #region helper

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

    // #endregion
}

export default CollisionObject;
