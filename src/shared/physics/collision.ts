import { Vector2D } from "../types.js";
import CollisionObject from "./collisionObject.js";
import V2D from "./vector2d.js";

import Constants from "../constants.js";
import Circle from "./circle.js";
import Square from "./square.js";
const { SHAPES } = Constants;

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
    const push = V2D.multiplyScalar(minpushvector, minpush + .0001);
    object1.position = V2D.add(object1.position, push);

    if(!checkCollision(object1, object2)){
        return push;
    }else{
        return V2D.multiplyScalar(push, -1);
    }
}

/** Gets all of the axes to check for the SAT between two collision objects */
function getTestAxes(object1: CollisionObject, object2: CollisionObject): Vector2D[] {
    const axes = [
        ...object1.getSeperateAxisTheoremTestAxes(),
        ...object2.getSeperateAxisTheoremTestAxes(),
    ];

    if(object1.isRanged()){
        axes.push(getRangedTestAxis(object1, object2));
    }else if(object2.isRanged()){
        axes.push(getRangedTestAxis(object2, object1));
    }

    return axes;
}

/** Returns the test axis for the minimum point seperation between a ranged object and another object */
function getRangedTestAxis(rangedobject: CollisionObject, object2: CollisionObject): Vector2D {
    const point = rangedobject.getPointsForMinDist()[0];
    const testpoints = object2.getPointsForMinDist();

    let mindist = Infinity;
    let mindistpoint = testpoints[0];

    for(const testpoint of testpoints){
        const dist = V2D.getDistance(point, testpoint);

        if(dist < mindist){
            mindist = dist;
            mindistpoint = testpoint;
        }
    }

    return V2D.getUnitVector(V2D.getOrthogonal(V2D.subtract(point, mindistpoint)));
}

export function getCellCollisionObject(shape: number, size: number, pos: Vector2D): CollisionObject | null {
    switch(shape){
        case SHAPES.CIRCLE: {
            return new Circle(pos, size / 2);
        }
        case SHAPES.SQUARE: {
            return new Square(pos, size);
        }
        default: {
            return null;
        }
    }
}
