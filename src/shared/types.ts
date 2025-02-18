/** A position in space denoted with an x and y value */
type Pos = {
    x: number;
    y: number;
}

/** A circle in space at the position (x, y) with the given radius */
type Circle = Pos & { radius: number; }

/** A line segment in space with the given start and end points */
type LineSegment = {
    p1: Pos;
    p2: Pos;
}

/** A color in rgb format */
type Color = {
    r: number;
    g: number;
    b: number;
}