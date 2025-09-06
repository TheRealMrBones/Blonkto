import { Vector2D } from "../types.js";
import CollisionObject from "./collisionObject.js";
import V2D from "./vector2d.js";

/** checks if the two given collision objects are colliding using SAT */
export function checkCollision(object1: CollisionObject, object2: CollisionObject): boolean {
    const axes = getTestAxes(object1, object2);

    for(const axis of axes){
        const range1 = object1.getSeperateAxisTheoremRange(axis);
        const range2 = object2.getSeperateAxisTheoremRange(axis);

        const dist = Math.max(range1[0], range2[0]) - Math.min(range1[1], range2[1]);

        if(dist >= 0) return false; // found a separating axis so no collision
    }

    return true;
}

/** returns the collision push of two objects using SAT */
export function getCollisionPush(object1: CollisionObject, object2: CollisionObject): Vector2D | null {
    const axes = getTestAxes(object1, object2);

    let minpush = Infinity;
    let minpushvector: Vector2D = [0, 0];

    for(const axis of axes){
        const range1 = object1.getSeperateAxisTheoremRange(axis);
        const range2 = object2.getSeperateAxisTheoremRange(axis);

        const dist = Math.max(range1[0], range2[0]) - Math.min(range1[1], range2[1]);

        if(dist >= 0) return null; // found a separating axis so no collision

        if(-dist < minpush){
            minpush = -dist;
            minpushvector = axis;
        }
    }

    // make sure push goes the right way by test pushing now
    object1.position = V2D.multiplyScalar(object1.position, minpush);

    if(!checkCollision(object1, object2)){
        return V2D.multiplyScalar(minpushvector, minpush);
    }else{
        return V2D.multiplyScalar(minpushvector, -minpush);
    }
}

/** Gets all of the axes to check for the SAT between two collision objects */
function getTestAxes(object1: CollisionObject, object2: CollisionObject): Vector2D[] {
    const axes = [
        ...object1.getSeperateAxisTheoremTestAxes(),
        ...object2.getSeperateAxisTheoremTestAxes(),
    ];

    if(axes.length == 0)
        return [V2D.getUnitVector(V2D.subtract(object1.position, object2.position))];

    return axes;
}
