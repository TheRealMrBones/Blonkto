import CollisionObject from "./collisionObject.js";
import Vector2D from "./vector2d.js";

/** A closed convex polygon in 2d space */
abstract class Polygon extends CollisionObject {
    /** Returns the vertices of this polygon relative to the origin of the polygon */
    abstract getVeticesFromOrigin(): Vector2D[];

    /** Returns the vertices of this polygon in world space */
    getVertices(): Vector2D[] {
        const vertices = this.getVeticesFromOrigin();
        for(const v of vertices){
            v.rotate(this.rotation);
            v.addVector(this.position);
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
            const edge = new Vector2D(vertices[i + 1].x - vertices[i].x, vertices[i + 1].y - vertices[i].y);
            normals.push(edge.getOrthogonal().getUnitVector());
        }

        return normals;
    }

    /** Returns the closest point of this object to the given point */
    getClosestPoint(point: Vector2D): Vector2D {
        const vertices = this.getVertices();
        let minvertex = vertices[0];

        let distvector = point.getCopy();
        distvector.subtractVector(vertices[0]);
        let mindist = distvector.getMagnitude();

        for(let i = 1; i < vertices.length; i++){
            const vertex = vertices[i];

            distvector = point.getCopy();
            distvector.subtractVector(vertex);
            const mag = distvector.getMagnitude();

            if(mag < mindist){
                mindist = mag;
                minvertex = vertex;
            }
        }

        return minvertex;
    }

    /** Returns the set of axis that should be tested between */
    getSeperateAxisTheoremTestAxes(): Vector2D[] {
        return this.getNormals();
    }

    /** Returns the range of this collision object over the given axis */
    getSeperateAxisTheoremRange(axis: Vector2D): [number, number] {
        const range: [number, number] = [-Infinity, Infinity];

        for(const vertex of this.getVertices()){
            const proj = axis.dotProduct(vertex);
            if(proj > range[1]) range[1] = proj;
            if(proj < range[0]) range[0] = proj;
        }

        return range;
    }
}

export default Polygon;
