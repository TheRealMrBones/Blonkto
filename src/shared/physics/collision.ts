import CollisionObject from "./collisionObject.js";
import Vector2D from "./vector2d.js";

/** checks if the two given collision objects are colliding using SAT */
export function checkCollision(object1: CollisionObject, object2: CollisionObject): boolean {
    const axes = getTestAxes(object1, object2);

    for(const axis of axes){
        const range1 = object1.getSeperateAxisTheoremRange(axis);
        const range2 = object2.getSeperateAxisTheoremRange(axis);

        if(Math.max(range1.min, range2.min) < Math.min(range1.max, range2.max))
            return false; // found a separating axis so no collision
    }

    return true;
}

/** Gets all of the axes to check for the SAT between two collision objects */
function getTestAxes(object1: CollisionObject, object2: CollisionObject): Vector2D[] {
    const closestpoint1 = object1.getClosestPoint(object2.position);
    const closestpoint2 = object2.getClosestPoint(object1.position);

    const closestpointsaxis = new Vector2D(
        closestpoint2.x - closestpoint1.x,
        closestpoint2.y - closestpoint1.y
    );

    const axes = [
        closestpointsaxis,
        ...object1.getSeperateAxisTheoremTestAxes(),
        ...object2.getSeperateAxisTheoremTestAxes(),
    ];

    // get axis for closest points of circles
    if(axes.length == 0){
        axes.push(new Vector2D(
            object1.position.x - object2.position.x,
            object1.position.y - object2.position.y
        ).getOrthogonal().getUnitVector());
    }

    return axes;
}
