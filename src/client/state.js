

const RENDER_DELAY = 100;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

export function processGameUpdate(update) {
    

    if (!firstServerTimestamp) {
        firstServerTimestamp = update.t;
        gameStart = Date.now();
    }
    gameUpdates.push(update);

    // Keep only one game update before the current server time
    const base = getBaseUpdate();
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        if (gameUpdates[i].t <= serverTime) {
            return i;
        }
    }
    return -1;
}

export function getCurrentState() {
    if (!firstServerTimestamp) {
        return {};
    }

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // If base is the most recent update we have, use its state.
    // Otherwise, interpolate between its state and the state of (base + 1).
    if (base < 0 || base === gameUpdates.length - 1) {
        return gameUpdates[gameUpdates.length - 1];
    } else {
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        return {
            others: interpolatePlayersArray(baseUpdate.others, next.others, ratio),
        };
    }
}

function interpolateObject(object1, object2, ratio) {
    if (!object2) {
        return object1;
    }

    const interpolated = {};
    Object.keys(object1).forEach(key => {
        if (key === 'dir') {
            interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
        } else {
            interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
        }
    });
    return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio) {
    return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}

function interpolateDirection(d1, d2, ratio) {
    const absD = Math.abs(d2 - d1);
    if (absD >= Math.PI) {
        if (d1 > d2) {
            return d1 + (d2 + 2 * Math.PI - d1) * ratio;
        } else {
            return d1 + (d2 - 2 * Math.PI - d1) * ratio;
        }
    } else {
        return d1 + (d2 - d1) * ratio;
    }
}

// #region Player Specific interpolation

function interpolatePlayer(player1, player2, badRatio){
    if (!player2) {
        return player1;
    }

    const serverTime = currentServerTime();
    const ratio = (serverTime - player1.lastupdated) / (player2.lastupdated - player1.lastupdated);

    const interpolated = {};
    Object.keys(player1).forEach(key => {
        if (key === 'dir') {
            interpolated[key] = interpolateDirection(player1[key], player2[key], badRatio);
        } else {
            interpolated[key] = player1[key] + (player2[key] - player1[key]) * ratio;
            
        }
    });
    return interpolated;
}

function interpolatePlayersArray(players1, players2, badRatio){
    return players1.map(o => interpolatePlayer(o, players2.find(o2 => o.id === o2.id), badRatio));
}

// #endregion