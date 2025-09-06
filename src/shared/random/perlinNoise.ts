import { Vector2D } from "../types.js";
import SeededRandom from "./seededRandom.js";

/** A custom randomomizer class for generating grid gradiants */
class PerlinNoise {
    private readonly rng: SeededRandom;
    private readonly xhash: number;
    private readonly yhash: number;
    
    private readonly scale: number;

    constructor(seed: number, scale: number) {
        this.rng = new SeededRandom(seed);
        this.xhash = this.rng.nextInt(0, SeededRandom.modulus);
        this.yhash = this.rng.nextInt(0, SeededRandom.modulus);

        this.scale = scale;
    }

    /** Returns the given linear sloped value as a new non-linear sloped value */
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /** Returns the interpolation between the two given values with the given ratio */
    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    /** Returns a gradient vector procedurally generated based on grid coordinates */
    private gradient(ix: number, iy: number): Vector2D {
        // Create a reproducible hash based on grid coordinates
        const hash = (ix * this.xhash) ^ (iy * this.yhash);

        // Seed a temporary RNG with this hash
        const temprng = new SeededRandom(hash >>> 0);
        const angle = temprng.next() * 2 * Math.PI;

        return [Math.cos(angle), Math.sin(angle)];
    }

    /** Returns dot product of gradient and distance vectors */
    private dotGridGradient(ix: number, iy: number, x: number, y: number): number {
        const [gx, gy] = this.gradient(ix, iy);
        const dx = x - ix;
        const dy = y - iy;
        return dx * gx + dy * gy;
    }

    /** Returns the noise value at the given coordinate of the gradient */
    public noise(ex: number, ey: number): number {
        // get float versions of x and y
        const x = ex / this.scale;
        const y = ey / this.scale;

        // Integer grid cell coordinates
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        // Interpolation weights
        const sx = this.fade(x - x0);
        const sy = this.fade(y - y0);

        // Dot products at each corner
        const n00 = this.dotGridGradient(x0, y0, x, y);
        const n10 = this.dotGridGradient(x1, y0, x, y);
        const n01 = this.dotGridGradient(x0, y1, x, y);
        const n11 = this.dotGridGradient(x1, y1, x, y);

        // Interpolate
        const ix0 = this.lerp(n00, n10, sx);
        const ix1 = this.lerp(n01, n11, sx);
        const value = this.lerp(ix0, ix1, sy);

        return value;
    }

    /** Returns the perlin noise grid of the given properties from this perlin noise object with values in [-1, 1] */
    public generateGrid(width: number, height: number, startx: number = 0, starty: number = 0): number[][] {
        const grid: number[][] = [];

        for (let y = starty; y < starty + height; y++) {
            const row: number[] = [];
            for (let x = startx; x < startx + width; x++) {
                const value = this.noise(x, y);
                row.push(value);
            }
            grid.push(row);
        }

        return grid;
    }
}

export default PerlinNoise;
