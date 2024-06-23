import { playerCollisions } from './collisions.js';
import { getSelf } from './input.js';

const RENDER_DELAY = 100;

const gameUpdates = [];
const playerUpdates = {};
const playerDelays = {};
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState(){
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update){
    

    if(!firstServerTimestamp){
        firstServerTimestamp = update.t;
        gameStart = Date.now();
    }
    gameUpdates.push(update);

    update.others.forEach(pu => {
        if(!playerUpdates[pu.id]){
            playerUpdates[pu.id] = [];
        }
        playerUpdates[pu.id].push(pu);
        playerDelays[pu.id] = pu.playerdelay;
    });

    update.leaves.forEach(pid => {
        delete playerUpdates[pid];
        delete playerDelays[pid];
    });

    // Keep only one game update before the current server time
    const base = getBaseUpdate();
    if(base > 0){
        gameUpdates.splice(0, base);
    }

    Object.keys(playerUpdates).forEach(pid => {
        const pbase = getPlayerBaseUpdate(pid);
        if (pbase > 0) {
            playerUpdates[pid].splice(0, pbase);
        }
    });
}

function currentServerTime(){
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate(){
    const serverTime = currentServerTime();
    for(let i = gameUpdates.length - 1; i >= 0; i--){
        if(gameUpdates[i].t <= serverTime){
            return i;
        }
    }
    return -1;
}

export function getCurrentState(){
    if(!firstServerTimestamp){
        return {};
    }

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    const others = [];
    Object.keys(playerUpdates).forEach(pid => {
        const pus = playerUpdates[pid];
        const pbase = getPlayerBaseUpdate(pid);
        const playerTime = currentPlayerTime(playerDelays[pid]);

        if(pbase < 0 || pbase === pus.length - 1){
            others.push(pus[pus.length - 1]);
        }else{
            const baseUpdate = pus[pbase];
            const next = pus[pbase + 1];
            const ratio = (playerTime - baseUpdate.lastupdated) / (next.lastupdated - baseUpdate.lastupdated);
            others.push(interpolateObject(baseUpdate, next, ratio));
        }
    });

    playerCollisions(getSelf(), others);

    if(base < 0 || base === gameUpdates.length - 1){
        return gameUpdates[gameUpdates.length - 1];
    }else{
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        return {
            others: others,
        };
    }
}

function interpolateObject(object1, object2, ratio){
    if(!object2){
        return object1;
    }

    const interpolated = {};
    Object.keys(object1).forEach(key => {
        if(key === 'dir'){
            interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
        }else if(key === 'username'){
            // don't interpolate these keys
            interpolated[key] = object1[key];
        }else{
            interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
        }
    });
    return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio){
    return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}

function interpolateDirection(d1, d2, ratio){
    const absD = Math.abs(d2 - d1);
    if(absD >= Math.PI){
        if(d1 > d2){
            return d1 + (d2 + 2 * Math.PI - d1) * ratio;
        }else{
            return d1 + (d2 - 2 * Math.PI - d1) * ratio;
        }
    }else{
        return d1 + (d2 - d1) * ratio;
    }
}

// #region Player Specific state functions

function currentPlayerTime(playerdelay){
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY - playerdelay;
}

function getPlayerBaseUpdate(pid){
    const playerTime = currentPlayerTime(playerDelays[pid]);
    for(let i = playerUpdates[pid].length - 1; i >= 0; i--){
        if(playerUpdates[pid][i].lastupdated <= playerTime){
            return i;
        }
    }
    return -1;
}

// #endregion