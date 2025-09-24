import { Vector2D } from "../types.js";
import CollisionObject from "./collisionObject.js";
import V2D from "./vector2d.js";

/** A closed convex polygon in 2d space */
abstract class Polygon extends CollisionObject {
    /** Returns the vertices of this polygon relative to the origin of the polygon */
    abstract getVeticesFromOrigin(): Vector2D[];

    /** Returns the vertices of this polygon in world space */
    getVertices(): Vector2D[] {
        const vertices = this.getVeticesFromOrigin();

        for(let i = 0; i < vertices.length; i++){
            if(this.rotation != 0)
                vertices[i] = V2D.rotate(vertices[i], this.rotation);
            vertices[i] = V2D.add(vertices[i], this.position);
        }

        return vertices;
    }

    /** Returns the vertex count of this polygon */
    abstract getVertexCount(): number;

    /** Returns the unit normal vector of each edge of this polygon */
    getNormals(): Vector2D[] {
        const vertices = this.getVertices();
        vertices.push(vertices[0]);

        const normals: Vector2D[] = [];
        for(let i = 0; i < this.getVertexCount(); i++){
            const edge = V2D.subtract(vertices[i + 1], vertices[i]);
            normals.push(V2D.getUnitVector(V2D.getOrthogonal(edge)));
        }

        return normals;
    }

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return this.getNormals();
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): Vector2D {
        const range: Vector2D = [-Infinity, Infinity];

        for(const vertex of this.getVertices()){
            const proj = V2D.dotProduct(axis, vertex);
            if(proj > range[1]) range[1] = proj;
            if(proj < range[0]) range[0] = proj;
        }

        return range;
    }

    /** Returns if this object has ranged minimum distance (aka a curve) */
    isRanged(): boolean {
        return false;
    }

    /** Returns the set of points to get the minimum distance point with a ranged object */
    getPointsForMinDist(): Vector2D[] {
        return this.getVertices();
    }
}

export default Polygon;
