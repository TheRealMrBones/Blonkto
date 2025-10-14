import Game from "../game.js";
import Player from "../objects/player.js";
import ChangesInventory from "./inventory/changesInventory.js";

/** A station (menu) with various components that can be opened and viewed by players */
class Station {
    readonly name: string;
    private readonly openers: {[key: string]: { player: Player, isnew: boolean }} = {};
    readonly multiopen: boolean = true;

    readonly inventories: ChangesInventory[] = [];

    constructor(name: string, multiopen?: boolean){
        this.name = name;
        if(multiopen !== undefined) this.multiopen = multiopen;
    }

    /** Has the given player open this station and returns success */
    openStation(player: Player): boolean {
        if(!this.multiopen && Object.keys(this.openers).length > 0) return false;

        this.openers[player.id] = {
            player: player,
            isnew: true,
        };
        player.station = this;

        return true;
    }

    /** Checks for openers that are moving or gone and removes them */
    checkOpeners(game: Game): void {
        for(const opener of Object.values(this.openers)){
            if(opener.player.moving || opener.player.layer.entityManager.getPlayer(opener.player.id) === undefined)
                this.closeStation(opener.player);
        }
    }

    /** Has the given player close this station */
    closeStation(player: Player): void {
        delete this.openers[player.id];
        player.station = null;
    }

    /** Clears the given players new status on this station */
    clearIsNew(player: Player): void {
        if(this.openers[player.id].isnew) this.openers[player.id].isnew = false;
    }

    /** Checks if the given player needs a recipe update because of this station */
    playerNeedsRecipeUpdate(player: Player): boolean {
        return (this.openers[player.id].isnew || this.inventories.some(i => i.anyChanges()));
    }

    // #region serialization

    /** Returns an object representing this station for a game update to the given players client */
    serializeForUpdate(player: Player): any {
        const isnew = this.openers[player.id].isnew;
        const returnobj: any = {
            name: this.name,
            isnew: isnew,
        };

        if(this.inventories.length > 0){
            returnobj.updates = isnew ?
                this.inventories.map(inventory => inventory.serializeForUpdate()) :
                this.inventories.map(inventory => inventory.getChanges());
        }

        return returnobj;
    }

    // #endregion
}

export default Station;
