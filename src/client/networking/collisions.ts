import { clientPush } from "../input/input.js";
import { getCell } from "../world/world.js";
import { Circle, LineSegment, Pos } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { SHAPES } = Constants;

// #region get collisions

/** Checks collisions between the current player and other nearby players */
export function playerCollisions(me: any, players: any[]): void {
    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = getDistance(me, player2);
        const realdist = dist - (me.scale / 2 + player2.scale / 2);
        if(realdist < 0){
            if(dist == 0){
                const dir = Math.random() * 2 * Math.PI;
                const randdist = Math.random() * .01;
                clientPush(-Math.sin(dir) * randdist, Math.cos(dir) * randdist);
            }else{
                const dir = Math.atan2(me.x - player2.x, player2.y - me.y);
                clientPush(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
            }
        }
    }
}

/** Checks collisions between the current player and any nearby blocks with hitboxes */
export function blockCollisions(me: any): void {
    // only search for collisions immediatly next to you
    const startx = Math.floor(me.x - me.scale / 2);
    const starty = Math.floor(me.y - me.scale / 2);

    // lists of possible collisions
    let walls: LineSegment[] = [];
    let circles: Circle[] = [];

    // find all circles and walls for collision
    for(let x = startx; x < me.x + me.scale / 2; x++){
        for(let y = starty; y < me.y + me.scale / 2; y++){
            const block = getCell(x, y).block;

            if(block){
                const pos: Pos = { x: x + .5, y: y + .5 };

                if(block.shape == SHAPES.SQUARE){
                    const wallResults = getSquareWalls(block.scale, pos);
                    walls = walls.concat(wallResults.walls);
                    circles = circles.concat(wallResults.points);
                }else if(block.shape == SHAPES.CIRCLE){
                    circles.push({ x: pos.x, y: pos.y, radius: block.scale / 2 });
                }
            }
        }
    }

    // calculate collisions and push accordingly
    const oldme = { x: me.x, y: me.y };
    wallCollisions(me, walls);
    circleCollisions(me, circles);
    clientPush(me.x - oldme.x, me.y - oldme.y);
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
function wallCollisions(me: any, walls: LineSegment[]): void {
    walls.forEach(w => { wallCollision(me, w); });
}

/** Perform wall collision on the current player with the given wall */
function wallCollision(me: any, wall: LineSegment): void {
    const p1 = wall.p1;
    const p2 = wall.p2;
    if(p1.x - p2.x == 0) {
        if(me.y > p1.y && me.y < p2.y || me.y < p1.y && me.y > p2.y) {
            if(Math.abs(me.x - p1.x) <= me.scale / 2) {
                if(me.x - p1.x > 0) {
                    me.x += (me.scale / 2 - Math.abs(me.x - p1.x));
                } else {
                    me.x -= (me.scale / 2 - Math.abs(me.x - p1.x));
                }
            }
        }
    } else if(p1.y - p2.y == 0) {
        if(me.x > p1.x && me.x < p2.x || me.x < p1.x && me.x > p2.x) {
            if(Math.abs(me.y - p1.y) <= me.scale / 2) {
                if(me.y - p1.y > 0) {
                    me.y += (me.scale / 2 - Math.abs(me.y - p1.y));
                } else {
                    me.y -= (me.scale / 2 - Math.abs(me.y - p1.y));
                }
            }
        }
    }
}

/** Perform all circle collisions on the current player */
function circleCollisions(me: any, circles: Circle[]): void {
    circles.forEach(c => { circleCollision(me, c); });
}

/** Perform circle collision on the current player with the given circle */
function circleCollision(me: any, circle: Circle): void {
    const dist = getDistance(me, circle);
    const realdist = dist - me.scale / 2 - circle.radius;
    if(realdist < 0){
        if(dist == 0){
            const dir = Math.random() * 2 * Math.PI;
            me.x -= Math.sin(dir) * realdist;
            me.y += Math.cos(dir) * realdist;
        }else{
            const dir = Math.atan2(me.x - circle.x, circle.y - me.y);
            me.x -= Math.sin(dir) * realdist;
            me.y += Math.cos(dir) * realdist;
        }
    }
}

// #endregion

// #region helpers

function getDistance(object1: Pos, object2: Pos): number {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// #endregion