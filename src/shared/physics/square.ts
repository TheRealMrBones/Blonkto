import Polygon from "shared/physics/polygon.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** A uniform square in 2d space */
class Square extends Polygon {
    private readonly halfwidth: number;

    constructor(position: Vector2D, width: number, rotation?: number){
        super(position, rotation);

        this.halfwidth = width / 2;
    }

    /** Returns the vertices of this square relative to the origin of the square */
    getVeticesFromOrigin(): Vector2D[] {
        return [
            [-this.halfwidth, -this.halfwidth],
            [this.halfwidth, -this.halfwidth],
            [this.halfwidth, this.halfwidth],
            [-this.halfwidth, this.halfwidth],
        ];
    }

    /** Returns the vertex count of this square */
    getVertexCount(): number {
        return 4;
    }

    /** Returns the unit normal vector of each edge of this square */
    override getNormals(): Vector2D[] {
        const vertices = this.getVertices();
        vertices.push(vertices[0]);

        const normals: Vector2D[] = [];
        for(let i = 0; i < 2; i++){
            const edge = V2D.subtract(vertices[i + 1], vertices[i]);
            normals.push(V2D.getUnitVector(V2D.getOrthogonal(edge)));
        }

        return normals;
    }
}

export default Square;
