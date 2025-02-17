type Pos = {
    x: number;
    y: number;
}

type Circle = Pos & { radius: number; }

type LineSegment = {
    p1: Pos;
    p2: Pos;
}

type Color = {
    r: number;
    g: number;
    b: number;
}