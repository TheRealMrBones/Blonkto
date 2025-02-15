import { push } from "./input.js";
import { getCell } from "./world.js";

import Constants from "../shared/constants.ts";
const { SHAPES } = Constants;

// #region get collisions

export function playerCollisions(me, players){
    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = getDistance(me, player2);
        const realdist = dist - (me.scale / 2 + player2.scale / 2);
        if(realdist < 0){
            if(dist == 0){
                const dir = Math.random() * 2 * Math.PI;
                const randdist = Math.random() * .01;
                push(-Math.sin(dir) * randdist, Math.cos(dir) * randdist);
            }else{
                const dir = Math.atan2(me.x - player2.x, player2.y - me.y);
                push(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
            }
        }
    }
}

export function blockCollisions(me){
    // only search for collisions immediatly next to you
    const startx = Math.floor(me.x - me.scale / 2);
    const starty = Math.floor(me.y - me.scale / 2);

    // lists of possible collisions
    let walls = [];
    let circles = [];

    // find all circles and walls for collision
    for(let x = startx; x < me.x + me.scale / 2; x++){
        for(let y = starty; y < me.y + me.scale / 2; y++){
            const block = getCell(x, y).block;

            if(block){
                const pos = makePos(x + block.scale / 2, y + block.scale / 2);

                if(block.shape == SHAPES.SQUARE){
                    const wallResults = getSquareWalls(block.scale, pos);
                    walls = walls.concat(wallResults.walls);
                    circles = circles.concat(wallResults.points);
                }else if(block.shape == SHAPES.CIRCLE){
                    circles.push(makeCircle(pos.x, ps.y, block.scale));
                }
            }
        }
    }

    // calculate collisions and push accordingly
    const oldme = { x: me.x, y: me.y };
    wallCollisions(me, walls);
    circleCollisions(me, circles);
    push(me.x - oldme.x, me.y - oldme.y);
}

function getSquareWalls(scale, pos){
    const p = [
        makeCircle(pos.x - scale / 2, pos.y - scale / 2, 0),
        makeCircle(pos.x - scale / 2, pos.y + scale / 2, 0),
        makeCircle(pos.x + scale / 2, pos.y + scale / 2, 0),
        makeCircle(pos.x + scale / 2, pos.y - scale / 2, 0),
    ];
    const walls = [
        makeWall(p[0], p[1]),
        makeWall(p[1], p[2]),
        makeWall(p[2], p[3]),
        makeWall(p[3], p[0]),
    ];

    return {
        walls: walls,
        points: p,
    };
}

// #endregion

// #region run collisions

function wallCollisions(me, walls){
    walls.forEach(w => { wallCollision(me, w); });
}

function wallCollision(me, wall){
    const p1 = wall.p1;
    const p2 = wall.p2;
    if (p1.x - p2.x == 0) {
        if (me.y > p1.y && me.y < p2.y || me.y < p1.y && me.y > p2.y) {
            if (Math.abs(me.x - p1.x) <= me.scale / 2) {
                if (me.x - p1.x > 0) {
                    me.x += (me.scale / 2 - Math.abs(me.x - p1.x));
                } else {
                    me.x -= (me.scale / 2 - Math.abs(me.x - p1.x));
                }
            }
        }
    } else if (p1.y - p2.y == 0) {
        if (me.x > p1.x && me.x < p2.x || me.x < p1.x && me.x > p2.x) {
            if (Math.abs(me.y - p1.y) <= me.scale / 2) {
                if (me.y - p1.y > 0) {
                    me.y += (me.scale / 2 - Math.abs(me.y - p1.y));
                } else {
                    me.y -= (me.scale / 2 - Math.abs(me.y - p1.y));
                }
            }
        }
    }
}

function circleCollisions(me, circles){
    circles.forEach(c => { circleCollision(me, c); });
}

function circleCollision(me, circle){
    const dist = getDistance(me, circle);
    const realdist = dist - me.scale / 2 - circle.scale / 2;
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

function getDistance(object1, object2){
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function makePos(x, y){
    return { x: x, y: y };
}

function makeCircle(x, y, scale){
    return { x: x, y: y, scale: scale };
}

function makeWall(p1, p2){
    return { p1: p1, p2: p2 };
}

// #endregion