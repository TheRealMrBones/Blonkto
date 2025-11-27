import { Color } from "shared/types.js";

/** Returns if the 2 given color values are the same */
export function equalColor(color1: Color, color2: Color): boolean {
    return (color1.r == color2.r && color1.g == color2.g && color1.b == color2.b);
}

/** Returns the combination of the two given colors */
export function combineColors(color1: Color, color2: Color): Color {
    return {
        r: color1.r * color2.r,
        g: color1.g * color2.g,
        b: color1.b * color2.b,
    };
}

/** Returns the default color (white) */
export function getBaseColor(): Color {
    return {
        r: 1,
        g: 1,
        b: 1,
    };
}
