import { Pos } from "../types.js";

class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /** Returns a vector2d created from the given postion */
    Vector2DFromPos(pos: Pos): Vector2D {
        return new Vector2D(pos.x, pos.y);
    }

    // #region getters

    /** Returns the magnitude this vector */
    getMagnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // #endregion

    // #region vector getters

    /** Returns a copy of this vector */
    getCopy(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    /** Returns the normal of this vector */
    getNormal(): Vector2D {
        const vector = this.getCopy();
        const magnitude = this.getMagnitude();

        vector.divideScalar(magnitude);

        return vector;
    }

    /** Returns a vector orthogonal to this vector */
    getOrthogonal(): Vector2D {
        return new Vector2D(-this.y, this.x);
    }
    
    // #endregion

    // #region scalar operations

    /** Multiplies all values in this vector by the requested amount */
    multiplyScalar(amount: number): void {
        this.x *= amount;
        this.y *= amount;
    }

    /** Divides all values in this vector by the requested amount */
    divideScalar(amount: number): void {
        this.x /= amount;
        this.y /= amount;
    }

    // #endregion

    // #region vector operations

    /** Returns the result vector from adding the two given vectors */
    static addVectors(vector1: Vector2D, vector2: Vector2D): Vector2D {
        return new Vector2D(vector1.x + vector2.x, vector1.y + vector2.y);
    }

    /** Returns the result vector from subtracting the first vector by the second vector */
    static subtractVectors(vector1: Vector2D, vector2: Vector2D): Vector2D {
        return new Vector2D(vector1.x - vector2.x, vector1.y - vector2.y);
    }

    /** Adds the given vector to this vector */
    addVector(vector: Vector2D): void {
        this.x += vector.x;
        this.y += vector.y;
    }

    /** Subtracts the given vector from this vector */
    subtractVector(vector: Vector2D): void {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    /** Returns the dot product of the given vector and this vector */
    dotProduct(vector: Vector2D): number {
        return this.x * vector.x + this.y * vector.y;
    }

    /** Returns the z value of the cross product between the given vectors */
    crossProduct(vector1: Vector2D, vector2: Vector2D): number {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    }

    /** Returns the projection of this vector onto the given vector */
    projectOnto(vector: Vector2D): Vector2D {
        const mult = this.dotProduct(vector) / vector.dotProduct(vector);
        return new Vector2D(vector.x * mult, vector.y * mult);
    }

    // #endregion
}

export default Vector2D;
