import { Vector2D } from "../types.js";
import Polygon from "./polygon.js";

/** A closed convex (hopefully) polygon in 2d space with custom vetices */
class CustomPolygon extends Polygon {
    private readonly points: Vector2D[];

    constructor(position: Vector2D, points: Vector2D[], rotation?: number){
        super(position, rotation);

        this.points = points;
    }

    /** Returns the vertices of this polygon relative to the origin of the polygon */
    getVeticesFromOrigin(): Vector2D[] {
        return this.points;
    }

    /** Returns the vertex count of this polygon */
    getVertexCount(): number {
        return this.points.length;
    }
}

export default CustomPolygon;
