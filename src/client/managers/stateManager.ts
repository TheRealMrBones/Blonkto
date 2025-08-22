import PlayerClient from "../playerClient.js";
import IndependentObject from "../state/independentObject.js";
import { GameUpdateContent } from "../../shared/messageContentTypes.js";
import { DarknessContent, PushContent, RecipesContent, SetColorContent, SetGamemodeContent, SetPosContent } from "../../shared/oneTimeMessageContentTypes.js";

import Constants from "../../shared/constants.js";
const { ONE_TIME_MSG_TYPES } = Constants;

import ClientConfig from "../../configs/client.js";
const { RENDER_DELAY } = ClientConfig.RENDER;
const { SERVER_RESYNC_THRESHOLD, CONNECTION_LOST_THRESHOLD } = ClientConfig.UPDATE;

// #region init

/** Manages client state updates and requests to and from the server */
class StateManager {
    private readonly playerclient: PlayerClient;
    private readonly gameUpdates: GameUpdateContent[] = [];
    private readonly independentObjects: {[key: string]: IndependentObject} = {};

    private gameStart: number = 0;
    private firstServerTimestamp: number = 0;
    private static serverDelay: number = 0;
    private newserverdelays: number = 0;
    private newserverdelayscount: number = 0;
    private lastupdatetime: number = Date.now();
    private lastserverupdate: number = 0;
    private lasttpsupdate: number = 0;

    constructor(playerclient: PlayerClient){
        this.playerclient = playerclient;
    }

    // #region init

    /** Initializes the world state for the client */
    initState(): void {
        this.gameStart = 0;
        this.firstServerTimestamp = 0;
    }

    // #endregion

    // #region getters

    /** Returns the last received server update time */
    getLastServerUpdate(): number {
        return this.lastserverupdate;
    }

    // #region get and set state

    /** Processes the given game update and adds it to the state queue */
    processGameUpdate(update: GameUpdateContent): void {
        // set lastUpdateTime
        this.lastupdatetime = Date.now();
        this.lastserverupdate = update.t;

        // update local world
        this.playerclient.world.unloadChunks(update.worldLoad.unloadChunks);
        this.playerclient.world.saveDefinitions(update.worldLoad.usedblocks, update.worldLoad.usedfloors, update.worldLoad.usedceilings);
        this.playerclient.world.loadChunks(update.worldLoad.loadChunks);
        this.playerclient.world.updateCells(update.worldLoad.updatedcells);

        // read one time messages
        for(const otm of update.onetimemessages){
            if(otm.type == ONE_TIME_MSG_TYPES.PUSH){
                const pushcontent: PushContent = otm.value;
                this.playerclient.inputManager.serverPush(pushcontent.pushx, pushcontent.pushy);
            }
            
            if(otm.type == ONE_TIME_MSG_TYPES.SET_POS){
                const setposcontent: SetPosContent = otm.value;
                this.playerclient.inputManager.setPos(setposcontent.pos);
            }
            
            if(otm.type == ONE_TIME_MSG_TYPES.SET_GAMEMODE){
                const setgamemodecontent: SetGamemodeContent = otm.value;
                this.playerclient.setGamemode(setgamemodecontent.gamemode);
            }
            
            if(otm.type == ONE_TIME_MSG_TYPES.SET_COLOR){
                const setcolorcontent: SetColorContent = otm.value;
                this.playerclient.renderer.setColor(setcolorcontent.color);
            }
            
            if(otm.type == ONE_TIME_MSG_TYPES.RECIPES){
                const recipescontent: RecipesContent = otm.value;
                this.playerclient.inventory.addRecipes(recipescontent.recipes);
            }
            
            if(otm.type == ONE_TIME_MSG_TYPES.DARKNESS){
                const darknesscontent: DarknessContent = otm.value;
                update.darkness = darknesscontent.darkness;
            }
        }

        // fill in missing update data (usually from one time messages)
        if(update.darkness === undefined){
            if(this.gameUpdates.length > 0){
                update.darkness = this.gameUpdates[this.gameUpdates.length - 1].darkness;
            }else{
                update.darkness = 0;
            }
        }

        // inventory updates
        update.inventoryupdates.forEach((iu: any) => {
            this.playerclient.inventory.setSingleInventorySlot(iu);
        });

        // station updates
        if(update.stationupdates !== null){
            if(update.stationupdates.isnew) this.playerclient.inventory.setStation(update.stationupdates.name);

            if(update.stationupdates.updates !== undefined){
                const stationinventoryupdates = update.stationupdates.updates[0];

                if(update.stationupdates.isnew){
                    this.playerclient.renderer.uiManager.openStation();
                    this.playerclient.inventory.setStationInventory(stationinventoryupdates);
                }else{
                    this.playerclient.inventory.updateStationInventory(stationinventoryupdates);
                }
            }else if(update.stationupdates.isnew){
                this.playerclient.renderer.uiManager.openInventory();
            }
        }

        // update recipe visibility
        if(update.inventoryupdates.length > 0) this.playerclient.inventory.setRecipeVisibility();
        else if(update.stationupdates !== null) if(update.stationupdates.isnew) this.playerclient.inventory.setRecipeVisibility();

        // update UI
        this.playerclient.renderer.uiManager.updateHealth(update.me.static.health);
        this.playerclient.renderer.uiManager.updateKills(update.me.static.kills);
        this.playerclient.renderer.uiManager.updateTab(update.tab);
        if(Date.now() - this.lasttpsupdate > 1000){
            this.playerclient.renderer.uiManager.updateTps(update.tps);
            this.lasttpsupdate = Date.now();
        }

        // if first update set server delay
        if(!this.firstServerTimestamp){
            this.gameStart = Date.now();
            this.firstServerTimestamp = update.t;
            StateManager.serverDelay = this.gameStart - this.firstServerTimestamp + RENDER_DELAY;
        }else{
            // if newserverdelay consistently different reset server delay (will visibly stutter)
            this.newserverdelays += Date.now() - update.t + RENDER_DELAY;
            this.newserverdelayscount++;

            if(this.newserverdelayscount == 10){
                const avgnewserverdelay = this.newserverdelays / this.newserverdelayscount;
                if(Math.abs(avgnewserverdelay - StateManager.serverDelay) > SERVER_RESYNC_THRESHOLD)
                    StateManager.serverDelay = avgnewserverdelay;
            
                this.newserverdelays = 0;
                this.newserverdelayscount = 0;
            }
        }

        // push updates to queue
        this.gameUpdates.push(update);

        Object.values(this.independentObjects).forEach(o => {
            o.exists = false;
        });
        update.others.forEach((pu: any) => {
            if(!this.independentObjects[pu.static.id]){
                this.independentObjects[pu.static.id] = new IndependentObject(pu);
            }else{
                this.independentObjects[pu.static.id].pushUpdate(pu);
            }
        });

        // delete players that no longer update
        Object.keys(this.independentObjects).forEach(id => {
            if(!this.independentObjects[id].exists) delete this.independentObjects[id];
        });
        
        // keep only one update before the current server/player time
        this.purgeUpdates(update.statereset);
        Object.values(this.independentObjects).forEach(o => {
            o.purgeUpdates(update.statereset);
        });
    }

    /** Returns all data relevant to the current state by interpolating the most recent past and future states */
    getCurrentState(): any {
        this.checkIfConnectionLost();

        if(!this.firstServerTimestamp) return {};

        const base = this.getBaseUpdate();
        const serverTime = StateManager.currentServerTime();

        // get states of independent objects
        const others: any[] = [];
        Object.values(this.independentObjects).forEach(o => {
            others.push(o.interpolateSelf());
        });

        // if base is the most recent update we have, use its state.
        // otherwise, interpolate between its state and the state of (base + 1).
        if(base < 0 || base === this.gameUpdates.length - 1){
            const update = this.gameUpdates[this.gameUpdates.length - 1];
            return {
                self: StateManager.noninterpolateObject(update.me),
                others: others,
                entities: StateManager.noninterpolateObjectArray(update.entities),
                darkness: update.darkness,
            };
        }else{
            const baseUpdate = this.gameUpdates[base];
            const next = this.gameUpdates[base + 1];
            const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
            return {
                self: StateManager.interpolateObject(baseUpdate.me, next.me, ratio),
                others: others,
                entities: StateManager.interpolateObjectArray(baseUpdate.entities, next.entities, ratio),
                darkness: baseUpdate.darkness! + (next.darkness! - baseUpdate.darkness!) * ratio,
            };
        }
    }

    // #endregion

    // #region interpolation

    /** Interpolates the given object between its two given states with the given ratio */
    static interpolateObject(object1: any, object2: any, ratio: number): any {
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
    static interpolateObjectArray(objects1: any[], objects2: any[], ratio: number): any[] {
        return objects1.map(o => this.interpolateObject(o, objects2.find(o2 => o.static.id === o2.static.id), ratio));
    }

    /** Interpolates the given direction between its two given states with the given ratio */
    static interpolateDirection(d1: number, d2: number, ratio: number): number {
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
    static noninterpolateObject(object1: any): any {
        return {...(object1.static), ...(object1.dynamic)};
    }

    /** Returns the given object array from its single state */
    static noninterpolateObjectArray(objects1: any[]): any[] {
        return objects1.map(o => this.noninterpolateObject(o));
    }

    // #endregion

    // #region helpers

    /** Returns the current server update time based on this clients delay */
    static currentServerTime(): number {
        return Date.now() - this.serverDelay;
    }

    /** 
     * returns the index of the base update, the first game update before
     * current server time, or -1 if N/A.
    */
    getBaseUpdate(): number {
        const serverTime = StateManager.currentServerTime();
        for(let i = this.gameUpdates.length - 1; i >= 0; i--){
            if(this.gameUpdates[i].t <= serverTime) return i;
        }
        return -1;
    }

    /** Clears all old state data to save room */
    purgeUpdates(statereset: boolean): void {
        if(statereset){
            this.gameUpdates.splice(0, this.gameUpdates.length - 1);
        }else{
            const base = this.getBaseUpdate();
            if(base > 0) this.gameUpdates.splice(0, base);
        }
    }

    /** Checks if connection might have been lost based on the time of the last game update received */
    checkIfConnectionLost(): void {
        const isconnectionlost = Date.now() - this.lastupdatetime > CONNECTION_LOST_THRESHOLD;
        this.playerclient.renderer.uiManager.toggleConnectionLost(isconnectionlost);
    };

    // #endregion
}

export default StateManager;
