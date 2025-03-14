import { currentServerTime, interpolateObject, noninterpolateObject } from "./state.js";

/** Represents a player loaded nearby in the game and holds their state over time information */
export class Player {
    exists: boolean;
    updates: any[];

    constructor(pu: any){
        this.exists = true;
        this.updates = [pu];
    }

    // #region receive updates

    /** Pushes a new state update to this player */
    pushUpdate(update: any): void {
        this.exists = true;
        this.updates.push(update);
    }

    // #endregion

    // #region get state

    /** Returns the interpolated data of this player for the current game time */
    interpolateSelf(): any {
        const base = this.getBaseUpdate();
        if(base < 0 || base === this.updates.length - 1){
            const update =  this.updates[this.updates.length - 1];
            return noninterpolateObject(update);
        }else{
            const baseUpdate = this.updates[base];
            const next = this.updates[base + 1];
            const ratio = (currentServerTime() - baseUpdate.t) / (next.t - baseUpdate.t);
            return interpolateObject(baseUpdate, next, ratio);
        }
    }

    // #endregion

    // #region helpers

    /** Returns the index for the current times base update (for interpolation) */
    getBaseUpdate(): number {
        const serverTime = currentServerTime();
        for(let i = this.updates.length - 1; i >= 0; i--){
            const updatetime = this.updates[i].t;
            if(updatetime <= serverTime) return i;
        }
        return -1;
    }

    /** Clears all old state data to save room */
    purgeUpdates(): void {
        const base = this.getBaseUpdate();
        if(base > 0) this.updates.splice(0, base);
    }

    // #endregion
}