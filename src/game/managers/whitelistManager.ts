import Game from "../game.js";

/** Manages the player whitelist for the server */
class WhitelistManager {
    private game: Game;
    private whitelistedplayers: {[key: string]: boolean};

    constructor(game: Game){
        this.game = game;
        this.whitelistedplayers = {};

        this.load();
        this.save();
    }
    
    // #region setters

    /** Adds or removes a user on the whitelist */
    whitelist(username: string, toggle: boolean): void {
        this.whitelistedplayers[username] = toggle;
        if(!toggle) delete this.whitelistedplayers[username];
        this.save();
    }

    /** Clears the entire whitelist */
    clearWhitelist(): void {
        this.whitelistedplayers = {};
        this.save();
    }

    // #endregion
    
    // #region getters

    /** Checks if a given user is whitelisted */
    isWhitelisted(username: string): boolean{
        return this.whitelistedplayers.hasOwnProperty(username);
    }

    /** Gets the list of all whitelisted players */
    whitelistList(): string[] {
        return Object.keys(this.whitelistedplayers);
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
            this.whitelistedplayers[username] = true;
        }
    }

    /** Saves the whitelist to file */
    save(): void {
        let data = "";

        for (const key of Object.keys(this.whitelistedplayers)) {
            data += key + "\n";
        }

        if(data.length > 0) data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("whitelist", data);
    }

    // #endregion
}

export default WhitelistManager;