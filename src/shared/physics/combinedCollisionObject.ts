import CollisionObject from "shared/physics/collisionObject.js";
import Rectangle from "shared/physics/rectangle.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** A collision object composed of multiple other collision objects */
class CombinedCollisionObject extends CollisionObject {
    private collisionobjects: [Vector2D, number, CollisionObject][] = [];

    constructor(position: Vector2D, collisionobjects: CollisionObject[], rotation?: number){
        super(position, rotation);

        this.collisionobjects = collisionobjects.map(co =>
            [co.getPosition(), co.getRotation(), co]);

        this.updateCollisionObjects();
    }

    // #region setters

    /** Sets the position of this collision object */
    override setPosition(position: Vector2D): void {
        super.setPosition(position);
        this.updateCollisionObjects();
    }

    /** Sets the rotation of this collision object */
    override setRotation(rotation: number): void {
        super.setRotation(rotation);
        this.updateCollisionObjects();
    }

    /** Sets the child collision objects positions and rotations to match the base */
    updateCollisionObjects(): void {
        for(const co of this.collisionobjects){
            const newrelpos = V2D.rotate(co[0], this.getRotation());
            const newpos = V2D.add(newrelpos, this.getPosition());

            co[2].setPosition(newpos);
            co[2].setRotation(co[1] + this.getRotation());
        }
    }

    // #endreigon

    // #region SAT (ignore these they are not used)

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return [];
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): Vector2D {
        return [0, 0];
    }

    /** Returns if this object has ranged minimum distance (aka a curve) */
    isRanged(): boolean {
        return false;
    }

    /** Returns the set of points to get the minimum distance point with a ranged object */
    getPointsForMinDist(): Vector2D[] {
        return [];
    }

    // #endregion

    // #region helper

    /** Returns the containing rectangle of this collision object */
    getContainingRect(): Rectangle {
        const collisionobjects = this.getCompositeObjects();

        let rect = collisionobjects[0].getContainingRect();
        let pos = rect.getPosition();
        let halfwidth = rect.width / 2;
        let halfheight = rect.height / 2;

        let minx = pos[0] - halfwidth;
        let miny = pos[1] - halfheight;
        let maxx = pos[0] + halfwidth;
        let maxy = pos[1] + halfheight;

        for(let i = 1; i < collisionobjects.length; i++){
            rect = collisionobjects[0].getContainingRect();
            pos = rect.getPosition();
            halfwidth = rect.width / 2;
            halfheight = rect.height / 2;

            const relminx = pos[0] - halfwidth;
            const relminy = pos[1] - halfheight;
            const relmaxx = pos[0] + halfwidth;
            const relmaxy = pos[1] + halfheight;

            if(relminx < minx) minx = relminx;
            if(relminy < miny) miny = relminy;
            if(relmaxx > maxx) maxx = relmaxx;
            if(relmaxy > maxy) maxy = relmaxy;
        }

        const width = maxx - minx;
        const height = maxy - miny;

        return new Rectangle([minx + width / 2, miny + height / 2], width, height);
    }

    /** Returns the composite collision objects of this collision object */
    override getCompositeObjects(): CollisionObject[] {
        return this.collisionobjects[0].map((co: any) => co[1]);
    }

    // #endregion
}

export default CombinedCollisionObject;
