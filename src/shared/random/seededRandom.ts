/** A custom randomizer class for generating random numbers deterministically given a seed */
class SeededRandom {
    private readonly startseed: number;
    private seed: number;
    
    static readonly modulus: number = 2 ** 31;
    private static readonly multiplier: number = 1103515245;
    private static readonly increment: number = 12345;

    constructor(startseed: number) {
        this.startseed = startseed % SeededRandom.modulus;
        this.seed = this.startseed;
    }

    // #region seed
    
    /** Returns the seed used to start this randomizer */
    getSeed(): number {
        return this.startseed;
    }

    // #endregion

    // #region random

    /** Returns the next random number in [0, 1) */
    next(): number {
        this.seed = (SeededRandom.multiplier * this.seed + SeededRandom.increment) % SeededRandom.modulus;
        return this.seed / SeededRandom.modulus;
    }

    /** Returns a random integer between min (inclusive) and max (exclusive) */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min)) + min;
    }

    /** Returns a random float between min (inclusive) and max (exclusive) */
    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    // #endregion
}

export default SeededRandom;
