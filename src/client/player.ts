import { currentServerTime, interpolateObject } from "./state.js";

export class Player {
    exists: boolean;
    delay: number;
    updates: any[];

    constructor(pu: any){
        this.exists = true;
        this.delay = pu.static.playerdelay;
        this.updates = [pu];
    }

    // #region receive updates

    pushUpdate(update: any){
        this.exists = true;
        this.updates.push(update);
    }

    // #endregion

    // #region get state

    interpolateSelf(){
        const base = this.getBaseUpdate();
        if(base < 0 || base === this.updates.length - 1){
            const update =  this.updates[this.updates.length - 1];
            return {...(update.static), ...(update.dynamic)};
        }else{
            const baseUpdate = this.updates[base];
            const next = this.updates[base + 1];
            const ratio = (this.currentTime() - baseUpdate.static.lastupdated) / (next.static.lastupdated - baseUpdate.static.lastupdated);
            return interpolateObject(baseUpdate, next, ratio);
        }
    }

    // #endregion

    // #region helpers

    currentTime(){
        return currentServerTime() - this.delay;
    }

    getBaseUpdate(){
        const playerTime = this.currentTime();
        for(let i = this.updates.length - 1; i >= 0; i--){
            if(this.updates[i].static.lastupdated <= playerTime){
                return i;
            }
        }
        return -1;
    }

    purgeUpdates(){
        const base = this.getBaseUpdate();
        if (base > 0) {
            this.updates.splice(0, base);
        }
    }

    // #endregion
}