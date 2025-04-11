import PlayerClient from "../playerClient.js";
import { toggleConnectionLost, updateHealth, updateKills, updateTab } from "../render/ui.js";
import { GameUpdateContent } from "../../shared/messageContentTypes.js";

import ClientConfig from "../../configs/client.js";
const { RENDER_DELAY } = ClientConfig.RENDER;
const { SERVER_RESYNC_THRESHOLD } = ClientConfig.UPDATE;

// #region init

class StateManager {
    private readonly playerclient: PlayerClient;
    private readonly gameUpdates: GameUpdateContent[] = [];

    private gameStart: number = 0;
    private firstServerTimestamp: number = 0;
    private serverDelay: number = 0;
    private newserverdelays: number = 0;
    private newserverdelayscount: number = 0;
    private lastUpdateTime: number = Date.now();

    constructor(playerclient: PlayerClient){
        this.playerclient = playerclient;
    }

    /** Initializes the world state for the client */
    initState(): void {
        this.gameStart = 0;
        this.firstServerTimestamp = 0;
    }

    /** Processes the given game update and adds it to the state queue */
    processGameUpdate(update: GameUpdateContent): void {
        // set lastUpdateTime
        this.lastUpdateTime = Date.now();

        // update local world
        if(update.worldLoad.unloadChunks) this.playerclient.world.unloadChunks(update.worldLoad.unloadChunks);
        if(update.worldLoad.loadChunks) this.playerclient.world.loadChunks(update.worldLoad.loadChunks);
        if(update.worldLoad.updatedcells) this.playerclient.world.updateCells(update.worldLoad.updatedcells);

        // get fixes
        if(update.fixes.setpos) this.playerclient.inputManager.setPos(update.fixes.setpos);
        this.playerclient.inputManager.serverPush(update.fixes.pushx, update.fixes.pushy);

        update.inventoryupdates.forEach((iu: any) => {
            this.playerclient.inventory.setSingleInventorySlot(iu);
        });
        if(update.inventoryupdates.length > 0) this.playerclient.inventory.setRecipeVisibility();
        this.playerclient.inventory.addRecipes(update.recipes);

        // update UI
        updateHealth(update.me.static.health);
        updateKills(update.me.static.kills);
        updateTab(update.tab);

        // if first update set server delay
        if(!this.firstServerTimestamp){
            this.gameStart = Date.now();
            this.firstServerTimestamp = update.t;
            this.serverDelay = this.gameStart - this.firstServerTimestamp + RENDER_DELAY;
        }else{
            // if newserverdelay consistently different reset server delay (will visibly stutter)
            this.newserverdelays += Date.now() - update.t + RENDER_DELAY;
            this.newserverdelayscount++;

            if(this.newserverdelayscount == 10){
                const avgnewserverdelay = this.newserverdelays / this.newserverdelayscount;
                if(Math.abs(avgnewserverdelay - this.serverDelay) > SERVER_RESYNC_THRESHOLD)
                    this.serverDelay = avgnewserverdelay;
            
                this.newserverdelays = 0;
                this.newserverdelayscount = 0;
            }
        }

        // push updates to queue
        this.gameUpdates.push(update);
        
        // keep only one update before the current server/player time
        this.purgeUpdates();
    }

    /** Returns all data relevant to the current state by interpolating the most recent past and future states */
    getCurrentState(): any {
        this.checkIfConnectionLost();

        if(!this.firstServerTimestamp) return {};

        const base = this.getBaseUpdate();
        const serverTime = this.currentServerTime();

        // if base is the most recent update we have, use its state.
        // otherwise, interpolate between its state and the state of (base + 1).
        if(base < 0 || base === this.gameUpdates.length - 1){
            const update = this.gameUpdates[this.gameUpdates.length - 1];
            return {
                self: this.noninterpolateObject(update.me),
                others: this.noninterpolateObjectArray(update.others),
                entities: this.noninterpolateObjectArray(update.entities),
            };
        }else{
            const baseUpdate = this.gameUpdates[base];
            const next = this.gameUpdates[base + 1];
            const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
            return {
                self: this.interpolateObject(baseUpdate.me, next.me, ratio),
                others: this.interpolateObjectArray(baseUpdate.others, next.others, ratio),
                entities: this.interpolateObjectArray(baseUpdate.entities, next.entities, ratio),
            };
        }
    }

    // #region interpolation

    /** Interpolates the given object between its two given states with the given ratio */
    interpolateObject(object1: any, object2: any, ratio: number): any {
        if(!object2) return object1;

        const interpolated = {...(object1.static)};
        Object.keys(object1.dynamic).forEach(key => {
            if(key === "dir"){
                interpolated[key] = this.interpolateDirection(object1.dynamic[key], object2.dynamic[key], ratio);
            }else{
                interpolated[key] = object1.dynamic[key] + (object2.dynamic[key] - object1.dynamic[key]) * ratio;
            }
        });
        return interpolated;
    }

    /** Interpolates the given object array between its two given states with the given ratio */
    interpolateObjectArray(objects1: any[], objects2: any[], ratio: number): any[] {
        return objects1.map(o => this.interpolateObject(o, objects2.find(o2 => o.static.id === o2.static.id), ratio));
    }

    /** Interpolates the given direction between its two given states with the given ratio */
    interpolateDirection(d1: number, d2: number, ratio: number): number {
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
    noninterpolateObject(object1: any): any {
        return {...(object1.static), ...(object1.dynamic)};
    }

    /** Returns the given object array from its single state */
    noninterpolateObjectArray(objects1: any[]): any[] {
        return objects1.map(o => this.noninterpolateObject(o));
    }

    // #endregion

    // #region helpers

    /** Returns the current server update time based on this clients delay */
    currentServerTime(): number {
        return Date.now() - this.serverDelay;
    }

    /** 
     * returns the index of the base update, the first game update before
     * current server time, or -1 if N/A.
    */
    getBaseUpdate(): number {
        const serverTime = this.currentServerTime();
        for(let i = this.gameUpdates.length - 1; i >= 0; i--){
            if(this.gameUpdates[i].t <= serverTime) return i;
        }
        return -1;
    }

    /** Clears all old state data to save room */
    purgeUpdates(): void {
        const base = this.getBaseUpdate();
        if(base > 0) this.gameUpdates.splice(0, base);
    }

    /** Checks if connection might have been lost based on the time of the last game update received */
    checkIfConnectionLost(): void {
        const isconnectionlost = Date.now() - this.lastUpdateTime > RENDER_DELAY * 2;
        toggleConnectionLost(isconnectionlost);
    };

    // #endregion
}

export default StateManager;