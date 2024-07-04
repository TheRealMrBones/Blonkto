import { push } from './input.js';
import { getCell } from './world.js';

const Constants = require('../shared/constants');
const { PLAYER_SCALE, SHAPES } = Constants;

export function playerCollisions(me, players){
    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = getDistance(me, player2);
        const realdist = dist - PLAYER_SCALE;
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
    const startx = Math.floor(me.x - PLAYER_SCALE / 2);
    const starty = Math.floor(me.y - PLAYER_SCALE / 2);

    for(let x = startx; x < me.x + PLAYER_SCALE / 2; x++){
        for(let y = starty; y < me.y + PLAYER_SCALE / 2; y++){
            const block = getCell(x, y).block;
            if(block){
                const pos = { 
                    x: x + block.scale / 2,
                    y: y + block.scale / 2
                };
                if(block.shape == SHAPES.SQUARE){
                    squareCollision(me, block.scale, pos);
                }else if(block.shape == SHAPES.CIRCLE){
                    circleCollision(me, block.scale, pos);
                }
            }
        }
    }
}

function squareCollision(me, scale, pos){
    const p = [
        [pos.x - scale / 2, pos.y - scale / 2],
        [pos.x - scale / 2, pos.y + scale / 2],
        [pos.x + scale / 2, pos.y + scale / 2],
        [pos.x + scale / 2, pos.y - scale / 2],
    ];
    const walls = [
        [p[0], p[1]],
        [p[1], p[2]],
        [p[2], p[3]],
        [p[3], p[0]],
    ];

    wallCollisions(me, walls);
    pointCollisions(me, p);
}

function wallCollisions(me, walls){
    const oldme = { x: me.x, y: me.y };

    walls.forEach(w => { 
        let p1 = w[0];
        let p2 = w[1];
        if (p1[0] - p2[0] == 0) {
            if (me.y > p1[1] && me.y < p2[1] || me.y < p1[1] && me.y > p2[1]) {
                if (Math.abs(me.x - p1[0]) <= PLAYER_SCALE / 2) {
                    if (me.x - p1[0] > 0) {
                        me.x += (PLAYER_SCALE / 2 - Math.abs(me.x - p1[0]))
                    } else {
                        me.x -= (PLAYER_SCALE / 2 - Math.abs(me.x - p1[0]))
                    }
                }
            }
        } else if (p1[1] - p2[1] == 0) {
            if (me.x > p1[0] && me.x < p2[0] || me.x < p1[0] && me.x > p2[0]) {
                if (Math.abs(me.y - p1[1]) <= PLAYER_SCALE / 2) {
                    if (me.y - p1[1] > 0) {
                        me.y += (PLAYER_SCALE / 2 - Math.abs(me.y - p1[1]))
                    } else {
                        me.y -= (PLAYER_SCALE / 2 - Math.abs(me.y - p1[1]))
                    }
                }
            }
        }
    });
    
    push(me.x - oldme.x, me.y - oldme.y);
}

function pointCollisions(me, points){
    const oldme = { x: me.x, y: me.y };

    points.forEach(p => { 
        let pdist = Math.sqrt((me.x - p[0]) * (me.x - p[0]) + (me.y - p[1]) * (me.y - p[1]));
        if (pdist <= PLAYER_SCALE / 2) {
            const realdist = pdist - PLAYER_SCALE / 2;
            if(realdist < 0){
                if(pdist == 0){
                    const dir = Math.random() * 2 * Math.PI;
                    me.x += (-Math.sin(dir) * realdist);
                    me.y += (Math.cos(dir) * realdist);
                }else{
                    const dir = Math.atan2(me.x - p[0], p[1] - me.y);
                    me.x += (-Math.sin(dir) * realdist);
                    me.y += (Math.cos(dir) * realdist);
                }
            }
        }
    });
    
    push(me.x - oldme.x, me.y - oldme.y);
}

function circleCollision(me, scale, pos){
    const dist = getDistance(me, pos);
    const realdist = dist - PLAYER_SCALE / 2 - scale / 2;
    if(realdist < 0){
        if(dist == 0){
            const dir = Math.random() * 2 * Math.PI;
            push(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
        }else{
            const dir = Math.atan2(me.x - pos.x, pos.y - me.y);
            push(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
        }
    }
}

// #region helpers

function getDistance(object1, object2){
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// #endregion