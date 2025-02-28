/** A position in space denoted with an x and y value */
export type Pos = {
    x: number;
    y: number;
}

/** A circle in space at the position (x, y) with the given radius */
export type Circle = Pos & { radius: number; }

/** A line segment in space with the given start and end points */
export type LineSegment = {
    p1: Pos;
    p2: Pos;
}

/** A color in rgb format */
export type Color = {
    r: number;
    g: number;
    b: number;
}