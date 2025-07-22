/** A custom randomizer class for generating random numbers deterministically given a seed */
class SeededRandom {
    private readonly startseed: number;
    private seed: number;
    
    private readonly modulus: number = 2 ** 31;
    private readonly multiplier: number = 1103515245;
    private readonly increment: number = 12345;

    constructor(startseed: number) {
        this.startseed = startseed % this.modulus;
        this.seed = this.startseed;
    }

    /** Generates the next random number in [0, 1) */
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
}

export default SeededRandom;
