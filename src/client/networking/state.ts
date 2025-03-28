import { setPos, serverPush } from "../input/input.js";
import { Player } from "./player.js";
import { loadChunks, unloadChunks, updateCells } from "../world/world.js";
import { toggleConnectionLost, updateHealth, updateKills, updateTab } from "../render/ui.js";
import { addRecipes, setSingleInventorySlot, setRecipeVisibility } from "../inventory/inventory.js";
import { GameUpdateContent } from "../../shared/messagecontenttypes.js";

import ClientConfig from "../../configs/client.js";
const { RENDER_DELAY } = ClientConfig.RENDER;
const { SERVER_RESYNC_THRESHOLD } = ClientConfig.UPDATE;

// #region init

const gameUpdates: any[] = [];
const players: {[key: string]: any} = {};
let gameStart = 0;
let firstServerTimestamp = 0;
let serverDelay = 0;
let newserverdelays = 0;
let newserverdelayscount = 0;
let self: any;
let lastUpdateTime = Date.now();

/** Initializes the world state for the client */
export function initState(): void {
    gameStart = 0;
    firstServerTimestamp = 0;
}

// #endregion

// #region receive updates

/** Processes the given game update and adds it to the state queue */
export function processGameUpdate(update: GameUpdateContent): void {
    // set lastUpdateTime
    lastUpdateTime = Date.now();

    // update local world
    if(update.worldLoad.unloadChunks) unloadChunks(update.worldLoad.unloadChunks);
    if(update.worldLoad.loadChunks) loadChunks(update.worldLoad.loadChunks);
    if(update.worldLoad.updatedcells) updateCells(update.worldLoad.updatedcells);

    // get fixes
    if(update.fixes.setpos) setPos(update.fixes.setpos);
    serverPush(update.fixes.pushx, update.fixes.pushy);

    update.inventoryupdates.forEach((iu: any) => {
        setSingleInventorySlot(iu);
    });
    if(update.inventoryupdates.length > 0) setRecipeVisibility();
    addRecipes(update.recipes);

    // get self updates
    if(!self){
        self = new Player(update.me);
    }else{
        self.pushUpdate(update.me);
    }
    self.purgeUpdates();

    // update UI
    updateHealth(update.me.static.health);
    updateKills(update.me.static.kills);
    updateTab(update.tab);

    // set players default to not updated aka left (used later)
    Object.values(players).forEach(p => {
        p.exists = false;
    });

    // if first update set server delay
    if(!firstServerTimestamp){
        gameStart = Date.now();
        firstServerTimestamp = update.t;
        serverDelay = gameStart - firstServerTimestamp + RENDER_DELAY;
    }else{
        // if newserverdelay consistently different reset server delay (will visibly stutter)
        newserverdelays += Date.now() - update.t + RENDER_DELAY;
        newserverdelayscount++;

        if(newserverdelayscount == 10){
            const avgnewserverdelay = newserverdelays / newserverdelayscount;
            if(Math.abs(avgnewserverdelay - serverDelay) > SERVER_RESYNC_THRESHOLD)
                serverDelay = avgnewserverdelay;
        
            newserverdelays = 0;
            newserverdelayscount = 0;
        }
    }

    // push updates to queue
    gameUpdates.push(update);
    update.others.forEach((pu: any) => {
        pu.t = update.t;
        if(!players[pu.static.id]){
            players[pu.static.id] = new Player(pu);
        }else{
            players[pu.static.id].pushUpdate(pu);
        }
    });

    // delete players that no longer update
    Object.keys(players).forEach(pid => {
        if(!players[pid].exists) delete players[pid];
    });

    // keep only one update before the current server/player time
    purgeUpdates();
    Object.values(players).forEach(p => {
        p.purgeUpdates();
    });
}

// #endregion

// #region get state

/** Returns all data relevant to the current state by interpolating the most recent past and future states */
export function getCurrentState(): any {
    checkIfConnectionLost();

    if(!firstServerTimestamp) return {};

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // if base is the most recent update we have, use its state.
    // otherwise, interpolate between its state and the state of (base + 1).
    const others: any[] = [];
    Object.values(players).forEach(p => {
        others.push(p.interpolateSelf());
    });

    if(base < 0 || base === gameUpdates.length - 1){
        const update = gameUpdates[gameUpdates.length - 1];
        return {
            others: others,
            self: self.interpolateSelf(),
            entities: noninterpolateObjectArray(update.entities),
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

/** Interpolates the given object between its two given states with the given ratio */
export function interpolateObject(object1: any, object2: any, ratio: number): any {
    if(!object2) return object1;

    const interpolated = {...(object1.static)};
    Object.keys(object1.dynamic).forEach(key => {
        if(key === "dir"){
            interpolated[key] = interpolateDirection(object1.dynamic[key], object2.dynamic[key], ratio);
        }else{
            interpolated[key] = object1.dynamic[key] + (object2.dynamic[key] - object1.dynamic[key]) * ratio;
        }
    });
    return interpolated;
}

/** Interpolates the given object array between its two given states with the given ratio */
function interpolateObjectArray(objects1: any[], objects2: any[], ratio: number): any[] {
    return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.static.id === o2.static.id), ratio));
}

/** Interpolates the given direction between its two given states with the given ratio */
function interpolateDirection(d1: number, d2: number, ratio: number): number {
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

/** Returns the given object from its single state */
export function noninterpolateObject(object1: any): any {
    return {...(object1.static), ...(object1.dynamic)};
}

/** Returns the given object array from its single state */
function noninterpolateObjectArray(objects1: any[]): any[] {
    return objects1.map(o => noninterpolateObject(o));
}

// #endregion

// #region helpers

/** Returns the current server update time based on this clients delay */
export function currentServerTime(): number {
    return Date.now() - serverDelay;
}

/** 
 * returns the index of the base update, the first game update before
 * current server time, or -1 if N/A.
*/
function getBaseUpdate(): number {
    const serverTime = currentServerTime();
    for(let i = gameUpdates.length - 1; i >= 0; i--){
        if(gameUpdates[i].t <= serverTime) return i;
    }
    return -1;
}

/** Clears all old state data to save room */
function purgeUpdates(): void {
    const base = getBaseUpdate();
    if(base > 0) gameUpdates.splice(0, base);
}

/** Checks if connection might have been lost based on the time of the last game update received */
function checkIfConnectionLost(): void {
    const isconnectionlost = Date.now() - lastUpdateTime > RENDER_DELAY * 2;
    toggleConnectionLost(isconnectionlost);
};

// #endregion