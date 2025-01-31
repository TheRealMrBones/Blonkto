import { setPos, setSelf } from './input.js';
import { Player } from './player.js';
import { loadChunks, unloadChunks, updateCells } from './world.js';
import { toggleConnectionLost } from './ui.js';

import ClientConfig from '../configs/client.ts';
const { RENDER_DELAY } = ClientConfig.RENDER;

// #region init

const gameUpdates = [];
const players = {};
let gameStart = 0;
let firstServerTimestamp = 0;
let serverDelay = 0;
let self;

export function initState(){
    gameStart = 0;
    firstServerTimestamp = 0;
}

// #endregion

// #region receive updates

export function processGameUpdate(update){
    // set lastUpdateTime
    lastUpdateTime = Date.now();

    // update local world
    if(update.worldLoad.unloadChunks){
        unloadChunks(update.worldLoad.unloadChunks);
        loadChunks(update.worldLoad.loadChunks);
    }
    if(update.worldLoad.updatedcells){
        updateCells(update.worldLoad.updatedcells);
    }

    // get fixes
    if(update.fixes.setpos){
        setPos(update.fixes.setpos);
    }

    // get self updates
    if(!self){
        self = new Player(update.me);
    }else{
        self.pushUpdate(update.me);
    }
    self.purgeUpdates();

    // set players default to not updated aka left (used later)
    Object.values(players).forEach(p => {
        p.exists = false;
    });

    // if first update set server delay
    if(!firstServerTimestamp){
        gameStart = Date.now();
        firstServerTimestamp = update.t;
        serverDelay = gameStart - firstServerTimestamp + RENDER_DELAY;
    }

    // push updates to queue
    gameUpdates.push(update);
    update.others.forEach(pu => {
        if(!players[pu.static.id]){
            players[pu.static.id] = new Player(pu);
        }else{
            players[pu.static.id].pushUpdate(pu);
        }
    });

    // delete players that no longer update
    Object.keys(players).forEach(pid => {
        if(!players[pid].exists){
            delete players[pid];
        }
    });

    // keep only one update before the current server/player time
    purgeUpdates();
    Object.values(players).forEach(p => {
        p.purgeUpdates();
    });
}

// #endregion

// #region get state

export function getCurrentState(){
    checkIfConnectionLost();

    if(!firstServerTimestamp){
        return {};
    }

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // if base is the most recent update we have, use its state.
    // otherwise, interpolate between its state and the state of (base + 1).
    const others = [];
    Object.values(players).forEach(p => {
        others.push(p.interpolateSelf());
    });

    if(base < 0 || base === gameUpdates.length - 1){
        const update = gameUpdates[gameUpdates.length - 1];
        return {
            others: others,
            self: self.interpolateSelf(),
            entities: update.entities,
        };
    }else{
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        return {
            others: others,
            self: self.interpolateSelf(),
            entities: interpolateObjectArray(baseUpdate.entities, next.entities, ratio),
        };
    }
}

// #endregion

// #region interpolation

export function interpolateObject(object1, object2, ratio){
    if(!object2){
        return object1;
    }

    const interpolated = {...(object1.static)};
    Object.keys(object1.dynamic).forEach(key => {
        if(key === 'dir'){
            interpolated[key] = interpolateDirection(object1.dynamic[key], object2.dynamic[key], ratio);
        }else{
            interpolated[key] = object1.dynamic[key] + (object2.dynamic[key] - object1.dynamic[key]) * ratio;
        }
    });
    return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio){
    return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.static.id === o2.static.id), ratio));
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

// #endregion

// #region helpers

export function currentServerTime(){
    return Date.now() - serverDelay;
}

// returns the index of the base update, the first game update before
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

function purgeUpdates(){
    const base = getBaseUpdate();
    if(base > 0){
        gameUpdates.splice(0, base);
    }
}

let lastUpdateTime = Date.now();
function checkIfConnectionLost(){
    const isconnectionlost = Date.now() - lastUpdateTime > RENDER_DELAY;
    toggleConnectionLost(isconnectionlost);
};

// #endregion