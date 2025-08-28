import Vector2D from "./vector2d.js";

/** A closed convex polygon in 2d space */
abstract class Polygon {
    position: Vector2D;

    constructor(position: Vector2D){
        this.position = position;
    }

    /** Returns the vertices of this polygon relative to the origin of the polygon */
    abstract getVeticesFromOrigin(): Vector2D[];

    /** Returns the vertices of this polygon in world space */
    getVertices(): Vector2D[] {
        const vertices = this.getVeticesFromOrigin();
        for(const v of vertices){
            v.addVector(this.position);
        }
        return vertices;
    }

    /** Returns the vertex count of this polygon */
    abstract getVertexCount(): number;

    /** Returns the unit normal vector of each edge of this polygon */
    getNormals(): Vector2D[] {
        const vertices = this.getVeticesFromOrigin();
        vertices.push(vertices[0], vertices[1]);

        const normals: Vector2D[] = [];
        for(let i = 0; i < this.getVertexCount(); i++){
            const edge = new Vector2D(vertices[i + 1].x - vertices[i].x, vertices[i + 1].y - vertices[i].y);
            normals.push(edge.getOrthogonal().getUnitVector());
        }

        return normals;
    }
}

export default Polygon;
