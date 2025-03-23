import { Circle, LineSegment, Pos, CollisionObject, CircleCollisionObject } from "./types.js";

import Constants from "./constants.js";
const { SHAPES } = Constants;

// #region get collisions

/** Returns the push amounts of the object after colliding with other entities */
export function entityCollisions(me: CircleCollisionObject, entities: CircleCollisionObject[]): Pos {
    const oldpos: Pos = { x: me.x, y: me.y };
    const newpos: Pos = { x: me.x, y: me.y };

    for(let i = 0; i < entities.length; i++){
        const entity = entities[i];
        const push = entityCollision(me, newpos, entity);
        newpos.x += push.x;
        newpos.y += push.y;
    }

    return {
        x: newpos.x - oldpos.x,
        y: newpos.y - oldpos.y
    };
}

/** Returns the push amounts of the object after colliding with the other entity */
export function entityCollision(me: CircleCollisionObject, newpos: Pos, entity: CircleCollisionObject): Pos {
    const dist = getDistance(me as Pos, entity as Pos);
    const realdist = dist - (me.scale / 2 + entity.scale / 2);
    if(realdist < 0){
        const dir = (dist == 0) ? Math.random() * 2 * Math.PI : Math.atan2(me.x - entity.x, entity.y - me.y);

        return {
            x: -Math.sin(dir) * realdist,
            y: Math.cos(dir) * realdist
        };
    }else{
        return {
            x: 0,
            y: 0
        };
    }
}

/** Returns the push amounts of the player after colliding with cell blocks */
export function blockCollisions(me: CircleCollisionObject, blocks: CollisionObject[]): Pos {
    const oldpos: Pos = { x: me.x, y: me.y };
    const newpos: Pos = { x: me.x, y: me.y };

    // lists of possible collisions
    let walls: LineSegment[] = [];
    let circles: Circle[] = [];

    // find all circles and walls for collision
    for(const block of blocks){
        const pos: Pos = { x: block.x + .5, y: block.y + .5 };

        if(block.shape == SHAPES.SQUARE){
            const wallResults = getSquareWalls(block.scale, pos);
            walls = walls.concat(wallResults.walls);
            circles = circles.concat(wallResults.points);
        }else if(block.shape == SHAPES.CIRCLE){
            circles.push({ x: pos.x, y: pos.y, radius: block.scale / 2 });
        }
    }

    // calculate collisions and push accordingly
    wallCollisions(me, newpos, walls);
    circleCollisions(me, newpos, circles);
    
    return {
        x: newpos.x - oldpos.x,
        y: newpos.y - oldpos.y
    };
}

// #endregion

// #region shape collisions

/** Returns the collision objects for the given square shape */
function getSquareWalls(scale: number, pos: Pos): { walls: LineSegment[], points: Circle[] } {
    const p = [
        { x: pos.x - scale / 2, y: pos.y - scale / 2, radius: 0 },
        { x: pos.x - scale / 2, y: pos.y + scale / 2, radius: 0 },
        { x: pos.x + scale / 2, y: pos.y + scale / 2, radius: 0 },
        { x: pos.x + scale / 2, y: pos.y - scale / 2, radius: 0 },
    ];
    const walls = [
        { p1: p[0], p2: p[1] },
        { p1: p[1], p2: p[2] },
        { p1: p[2], p2: p[3] },
        { p1: p[3], p2: p[0] },
    ];

    return {
        walls: walls,
        points: p,
    };
}

/** Perform all wall collisions on the current player */
function wallCollisions(me: CircleCollisionObject, newpos: Pos, walls: LineSegment[]): void {
    walls.forEach(w => { wallCollision(me, newpos, w); });
}

/** Perform wall collision on the current player with the given wall */
function wallCollision(me: CircleCollisionObject, newpos: Pos, wall: LineSegment): void {
    const p1 = wall.p1;
    const p2 = wall.p2;
    if(p1.x - p2.x == 0) {
        if(newpos.y > p1.y && newpos.y < p2.y || newpos.y < p1.y && newpos.y > p2.y) {
            if(Math.abs(newpos.x - p1.x) <= me.scale / 2) {
                if(newpos.x - p1.x > 0) {
                    newpos.x += (me.scale / 2 - Math.abs(newpos.x - p1.x));
                } else {
                    newpos.x -= (me.scale / 2 - Math.abs(newpos.x - p1.x));
                }
            }
        }
    } else if(p1.y - p2.y == 0) {
        if(newpos.x > p1.x && newpos.x < p2.x || newpos.x < p1.x && newpos.x > p2.x) {
            if(Math.abs(newpos.y - p1.y) <= me.scale / 2) {
                if(newpos.y - p1.y > 0) {
                    newpos.y += (me.scale / 2 - Math.abs(newpos.y - p1.y));
                } else {
                    newpos.y -= (me.scale / 2 - Math.abs(newpos.y - p1.y));
                }
            }
        }
    }
}

/** Perform all circle collisions on the current player */
function circleCollisions(me: CircleCollisionObject, newpos: Pos, circles: Circle[]): void {
    circles.forEach(c => { circleCollision(me, newpos, c); });
}

/** Perform circle collision on the current player with the given circle */
function circleCollision(me: CircleCollisionObject, newpos: Pos, circle: Circle): void {
    const dist = getDistance(newpos, circle as Pos);
    const realdist = dist - me.scale / 2 - circle.radius;
    if(realdist < 0){
        const dir = (dist == 0) ? Math.random() * 2 * Math.PI : Math.atan2(newpos.x - circle.x, circle.y - newpos.y);
        newpos.x += -Math.sin(dir) * realdist;
        newpos.y += Math.cos(dir) * realdist;
    }
}

// #endregion

// #region helpers

/** Returns the distance between two positions */
export function getDistance(object1: Pos, object2: Pos): number {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/** Returns the list of cell positions that should be used when checking the given objects collisions */
export function getCollisionCheckCells(me: CircleCollisionObject): Pos[] {
    const startx = Math.floor(me.x - me.scale / 2);
    const starty = Math.floor(me.y - me.scale / 2);
    const cells: Pos[] = [];

    for(let x = startx; x < me.x + me.scale / 2; x++){
        for(let y = starty; y < me.y + me.scale / 2; y++){
            cells.push({ x: x, y: y });
        }
    }

    return cells;
}

// #endregion