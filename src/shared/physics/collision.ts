import CollisionObject from "./collisionObject.js";

/** checks if the two given collision objects are colliding using SAT */
export function checkCollision(object1: CollisionObject, object2: CollisionObject): boolean {
    const axes = [
        ...object1.getSeperateAxisTheoremTestAxes(),
        ...object2.getSeperateAxisTheoremTestAxes(),
    ];

    for(const axis of axes){
        const range1 = object1.getSeperateAxisTheoremRange(axis);
        const range2 = object2.getSeperateAxisTheoremRange(axis);

        if(Math.max(range1.min, range2.min) < Math.min(range1.max, range2.max))
            return false; // found a separating axis so no collision
    }

    return true;
}
