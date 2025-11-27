import Game from "game/game.js";

/** Manages the player whitelist for the server */
class WhitelistManager {
    private readonly game: Game;
    private readonly whitelistedplayers: Set<string> = new Set<string>();

    constructor(game: Game){
        this.game = game;

        this.load();
        this.save();
    }

    // #region setters

    /** Adds or removes a user on the whitelist */
    whitelist(username: string, toggle: boolean): void {
        if(toggle) this.whitelistedplayers.add(username);
        else this.whitelistedplayers.delete(username);
        this.save();
    }

    /** Clears the entire whitelist */
    clearWhitelist(): void {
        this.whitelistedplayers.clear();
        this.save();
    }

    // #endregion

    // #region getters

    /** Checks if a given user is whitelisted */
    isWhitelisted(username: string): boolean{
        return this.whitelistedplayers.has(username);
    }

    /** Gets the number of whitelisted players on the server */
    whitelistCount(): number {
        return this.whitelistedplayers.size;
    }

    /** Gets the list of all whitelisted players */
    whitelistList(): MapIterator<string> {
        return this.whitelistedplayers.values();
    }

    // #endregion

    // #region saving

    /** Loads the whitelist from the save */
    load(): void {
        if(!this.game.fileManager.fileExists("whitelist")) return;

        const rawdata = this.game.fileManager.readFile("whitelist");
        if(!rawdata) return;
        if(rawdata.length == 0 || rawdata.trim() === "") return;

        const data = rawdata.split("\n");

        for(const username of data){
            this.whitelistedplayers.add(username);
        }
    }

    /** Saves the whitelist to file */
    save(): void {
        let data = "";

        for (const key of this.whitelistedplayers.values()) {
            data += key + "\n";
        }

        if(data.length > 0) data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("whitelist", data);
    }

    // #endregion
}

export default WhitelistManager;
