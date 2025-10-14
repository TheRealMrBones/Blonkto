import Game from "../game.js";

/** Manages the list of banned players for the server */
class BanManager {
    private readonly game: Game;
    private readonly bannedplayers: Map<string, string> = new Map<string, string>();

    constructor(game: Game){
        this.game = game;

        this.load();
        this.save();
    }

    // #region setters

    /** Adds a user to the ban list */
    ban(username: string, reason: string): void {
        this.bannedplayers.set(username, reason);
        this.save();
    }

    /** Removes a user from the ban list */
    pardon(username: string): void {
        this.bannedplayers.delete(username);
        this.save();
    }

    /** Clears the entire ban list */
    clearBanList(): void {
        this.bannedplayers.clear();
        this.save();
    }

    // #endregion

    // #region getters

    /** Checks if a given user is banned */
    isBanned(username: string): boolean{
        return this.bannedplayers.has(username);
    }

    /** Gets the reason for a given user's ban */
    banReason(username: string): string {
        return this.bannedplayers.get(username)!;
    }

    /** Gets the number of banned players on the server */
    banCount(): number {
        return this.bannedplayers.size;
    }

    /** Gets the list of all banned players */
    banList(): MapIterator<string> {
        return this.bannedplayers.keys();
    }

    // #endregion

    // #region saving

    /** Loads the ban list from the save */
    load(): void {
        if(!this.game.fileManager.fileExists("banlist")) return;

        const rawdata = this.game.fileManager.readFile("banlist");
        if(!rawdata) return;
        if(rawdata.length == 0 || rawdata.trim() === "") return;

        const data = rawdata.split("\n");

        for(const rawbandata of data){
            const bandata = rawbandata.split(",");
            this.bannedplayers.set(bandata[0], bandata[1]);
        }
    }

    /** Saves the ban list to file */
    save(): void {
        let data = "";

        for (const key of this.bannedplayers.keys()) {
            data += key + "," + this.bannedplayers.get(key) + "\n";
        }

        if(data.length > 0) data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("banlist", data);
    }

    // #endregion
}

export default BanManager;
