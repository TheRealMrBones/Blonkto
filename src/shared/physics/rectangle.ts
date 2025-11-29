import Polygon from "shared/physics/polygon.js";
import V2D from "shared/physics/vector2d.js";
import { Vector2D } from "shared/types.js";

/** A rectangle in 2d space */
class Rectangle extends Polygon {
    readonly width: number;
    readonly height: number;

    cornerpivot: boolean = false;

    constructor(position: Vector2D, width: number, height: number, rotation?: number){
        super(position, rotation);

        this.width = width;
        this.height = height;
    }

    /** Makes the pivot of this rectangle the top left corner instead of the center */
    setCornerPivot(): this {
        this.cornerpivot = true;
        return this;
    }

    /** Returns the vertices of this rectangle relative to the origin of the rectangle */
    getVeticesFromOrigin(): Vector2D[] {
        const halfwidth = this.width / 2;
        const halfheight = this.height / 2;

        if(this.cornerpivot){
            return [
                [0, 0],
                [0, this.height],
                [this.width, this.height],
                [this.width, 0],
            ];
        }

        return [
            [-halfwidth, -halfheight],
            [halfwidth, -halfheight],
            [halfwidth, halfheight],
            [-halfwidth, halfheight],
        ];
    }

    /** Returns the vertex count of this rectangle */
    getVertexCount(): number {
        return 4;
    }

    /** Returns the unit normal vector of each edge of this rectangle */
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

export default Rectangle;
