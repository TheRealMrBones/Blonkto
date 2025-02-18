import Game from "../game.js";

/** Manages the list of banned players for the server */
class BanManager {
    game: Game;
    bannedplayers: {[key: string]: string};

    constructor(game: Game){
        this.game = game;
        this.bannedplayers = {};

        this.load();
    }
    
    // #region setters

    /** Adds a user to the ban list */
    ban(username: string, reason: string): void {
        username = username.toLowerCase();
        this.bannedplayers[username] = reason;
        this.save();
    }

    /** Removes a user from the ban list */
    pardon(username: string): void {
        username = username.toLowerCase();
        delete this.bannedplayers[username];
        this.save();
    }

    /** Clears the entire ban list */
    clearBanList(): void {
        this.bannedplayers = {};
        this.save();
    }

    // #endregion
    
    // #region getters

    /** Checks if a given user is banned */
    isBanned(username: string): boolean{
        username = username.toLowerCase();
        return this.bannedplayers.hasOwnProperty(username);
    }

    /** Gets the reason for a given user's ban */
    banReason(username: string): string {
        username = username.toLowerCase();
        return this.bannedplayers[username];
    }

    /** Gets the list of all banned players */
    banList(): string[] {
        return Object.keys(this.bannedplayers);
    }

    // #endregion
    
    // #region saving

    /** Loads the ban list from the save */
    load(): void {
        if(!this.game.fileManager.fileExists("banlist")){
            return;
        }

        const rawdata = this.game.fileManager.readFile("banlist");
        if(!rawdata){
            return;
        }
        if(rawdata.length == 0 || rawdata.trim() === ""){
            return;
        }

        const data = rawdata.split("|");

        for(const rawbandata of data){
            const bandata = rawbandata.split(",");
            this.ban(bandata[0], bandata[1]);
        }
    }

    /** Saves the ban list to file */
    save(): void {
        let data = "";

        for (const key of Object.keys(this.bannedplayers)) {
            data += key + "," + this.bannedplayers[key] + "|";
        }

        if(data.length > 0)
            data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("banlist", data);
    }

    // #endregion
}

export default BanManager;