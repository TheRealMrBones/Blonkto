import { Vector2D } from "../types.js";

/** Static helper methods for Vector2D operations */
class V2D {
    // #region getters

    /** Returns the magnitude this vector */
    static getMagnitude(vector: Vector2D): number {
        return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    }

    /** Returns the distance between the two given vectors */
    static getDistance(vector1: Vector2D, vector2: Vector2D): number {
        return V2D.getMagnitude(V2D.subtract(vector1, vector2));
    }

    // #endregion

    // #region vector getters

    /** Returns a copy of this vector */
    static getCopy(vector: Vector2D): Vector2D {
        return [vector[0], vector[1]];
    }

    /** Returns the unit vector of this vector */
    static getUnitVector(vector: Vector2D): Vector2D {
        const magnitude = V2D.getMagnitude(vector);

        // if magnitude is 0 just return some random direction
        if(magnitude == 0)
            return V2D.rotate([1, 0], Math.random() * Math.PI * 2);

        return V2D.divideScalar(vector, magnitude);
    }

    /** Returns a vector orthogonal to this vector */
    static getOrthogonal(vector: Vector2D): Vector2D {
        return [-vector[1], vector[0]];
    }

    // #endregion

    // #region comparators

    /** Returns if the two vectors are equal */
    static areEqual(vector1: Vector2D, vector2: Vector2D): boolean {
        return (vector1[0] == vector2[0] && vector1[1] == vector2[1]);
    }

    // #endregion

    // #region scalar operations

    /** Multiplies all values in this vector by the requested amount */
    static multiplyScalar(vector: Vector2D, amount: number): Vector2D {
        return [vector[0] * amount, vector[1] * amount];
    }

    /** Divides all values in this vector by the requested amount */
    static divideScalar(vector: Vector2D, amount: number): Vector2D {
        return [vector[0] / amount, vector[1] / amount];
    }

    /** Rotates this vector by the given radians */
    static rotate(vector: Vector2D, radians: number): Vector2D {
        return [
            vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians),
            vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians)
        ];
    }

    // #endregion

    // #region vector operations

    /** Returns the result vector from adding the two given vectors */
    static add(vector1: Vector2D, vector2: Vector2D): Vector2D {
        return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
    }

    /** Returns the result vector from subtracting the first vector by the second vector */
    static subtract(vector1: Vector2D, vector2: Vector2D): Vector2D {
        return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
    }

    /** Returns the dot product of the given vector and this vector */
    static dotProduct(vector1: Vector2D, vector2: Vector2D): number {
        return vector1[0] * vector2[0] + vector1[1] * vector2[1];
    }

    /** Returns the z value of the cross product between the given vectors */
    static crossProduct(vector1: Vector2D, vector2: Vector2D): number {
        return vector1[0] * vector2[1] - vector1[1] * vector2[0];
    }

    /** Returns the projection of this vector onto the given vector */
    static projectOnto(vector1: Vector2D, vector2: Vector2D): Vector2D {
        const mult = V2D.dotProduct(vector1, vector2) / V2D.dotProduct(vector2, vector2);
        return V2D.multiplyScalar(vector2, mult);
    }

    // #endregion
}

export default V2D;
