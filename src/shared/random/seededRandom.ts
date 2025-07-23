/** A custom randomizer class for generating random numbers deterministically given a seed */
class SeededRandom {
    private readonly startseed: number;
    private seed: number;
    
    readonly modulus: number = 2 ** 31;
    private readonly multiplier: number = 1103515245;
    private readonly increment: number = 12345;
    
    private readonly xhash: number = 1836311903;
    private readonly yhash: number = 2971215073;

    constructor(startseed: number) {
        this.startseed = startseed % this.modulus;
        this.seed = this.startseed;
    }

    // #region seed
    
    /** Returns the seed used to start this randomizer */
    getSeed(): number {
        return this.startseed;
    }

    /** Returns a reproducable subseed of this seed given 1-2 subseed values and the main seed value */
    getSubSeed(x: number, y?: number): number {
        const hash = y !== undefined ? 
            (x * this.xhash) ^ (y * this.yhash) ^ this.startseed :
            (x * this.xhash) ^ this.startseed;
        return hash;
    }

    // #endregion

    // #region random

    /** Returns the next random number in [0, 1) */
    next(): number {
        this.seed = (this.multiplier * this.seed + this.increment) % this.modulus;
        return this.seed / this.modulus;
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
