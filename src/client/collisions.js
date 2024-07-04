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
                if(block.shape == SHAPES.SQUARE){
                    squareCollision(me, block.scale, { x: x, y: y });
                }else if(block.shape == SHAPES.CIRCLE){
                    circleCollision(me, block.scale, { x: x + block.scale / 2, y: y + block.scale / 2 });
                }
            }
        }
    }
}

function squareCollision(me, scale, pos){

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