import { Color, Pos } from "./types.js";

/** Returns if the 2 given pos values are the same */
export function equalPos(pos1: Pos, pos2: Pos): boolean {
    return (pos1.x == pos2.x && pos1.y == pos2.y);
}

/** Returns if the 2 given color values are the same */
export function equalColor(color1: Color, color2: Color): boolean {
    return (color1.r == color2.r && color1.g == color2.g && color1.b == color2.b);
}