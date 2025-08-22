import StateManager from "../managers/stateManager.js";

/** The object used to interpolate states for independent objects (uses personal update times instead of game updates) */
class IndependentObject {
    exists: boolean;
    updates: any[];

    constructor(pu: any){
        this.exists = true;
        this.updates = [pu];
    }

    // #region receive updates

    /** Pushes a new state update to this object */
    pushUpdate(update: any): void {
        this.exists = true;
        this.updates.push(update);
    }

    // #endregion

    // #region get state

    /** Returns the interpolated data of this object for the current game time */
    interpolateSelf(): any {
        const base = this.getBaseUpdate();
        if(base < 0 || base === this.updates.length - 1){
            const update =  this.updates[this.updates.length - 1];
            return StateManager.noninterpolateObject(update);
        }else{
            const baseUpdate = this.updates[base];
            const next = this.updates[base + 1];
            const ratio = (StateManager.currentServerTime() - baseUpdate.static.lastupdated) / (next.static.lastupdated - baseUpdate.static.lastupdated);
            return StateManager.interpolateObject(baseUpdate, next, ratio);
        }
    }

    // #endregion

    // #region helpers

    /** Returns the index for the current times base update (for interpolation) */
    getBaseUpdate(): number {
        const serverTime = StateManager.currentServerTime();
        for(let i = this.updates.length - 1; i >= 0; i--){
            const updatetime = this.updates[i].static.lastupdated;
            console.log(updatetime);
            if(updatetime <= serverTime) return i;
        }
        return -1;
    }

    /** Clears all old state data to save room */
    purgeUpdates(statereset: boolean): void {
        if(statereset){
            this.updates.splice(0, this.updates.length - 1);
        }else{
            const base = this.getBaseUpdate();
            if(base > 0) this.updates.splice(0, base);
        }
    }

    // #endregion
}

export default IndependentObject;
