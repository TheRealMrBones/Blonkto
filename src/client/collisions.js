import { push } from './input.js';

const Constants = require('../shared/constants');

export function playerCollisions(player, players){
    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = getDistance(player, player2);
        const realdist = dist - Constants.PLAYER_SCALE;
        if(realdist < 0){
            if(dist == 0){
                const dir = Math.random() * 2 * Math.PI;
                const randdist = Math.random() * .01;
                push(-Math.sin(dir) * randdist, Math.cos(dir) * randdist);
            }else{
                const dir = Math.atan2(player.x - player2.x, player2.y - player.y);
                push(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
            }
        }
    }
}

function getDistance(object1, object2){
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}