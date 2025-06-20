import crypto from "crypto";

import Game from "../game.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { OP_PASSCODE, OP_PASSCODE_WHEN_OPS } = ServerConfig.OP_PASSCODE;

/** Manages the list of operators for the server */
class OpManager {
    private readonly logger: Logger;
    
    private game: Game;
    private oppedplayers: {[key: string]: boolean};
    
    readonly oppasscode: string;
    oppasscodeused: boolean;

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.GAME);

        this.game = game;
        this.oppedplayers = {};

        this.load();
        this.save();

        // op passcode (one time use to give owner op)
        this.oppasscode = crypto.randomUUID();
        if(OP_PASSCODE && (this.opCount() == 0 || OP_PASSCODE_WHEN_OPS)){
            this.oppasscodeused = false;
            this.logger.info(`oppasscode: ${this.oppasscode}`);
        }else{
            this.oppasscodeused = true;
        }
    }
    
    // #region setters

    /** Adds a user to the operator list */
    op(username: string): void {
        this.oppedplayers[username] = true;
        this.save();
    }

    /** Removes a user from the operator list */
    deop(username: string): void {
        delete this.oppedplayers[username];
        this.save();
    }

    /** Clears the entire operator list */
    clearOpList(username?: string): void {
        this.oppedplayers = {};
        
        // if username given keep that user opped
        if(username !== undefined) this.oppedplayers[username] = true;
        
        this.save();
    }

    // #endregion
    
    // #region getters

    /** Checks if a given user is an operator */
    isOp(username: string): boolean {
        return this.oppedplayers.hasOwnProperty(username);
    }

    /** Gets the number of operators on the server */
    opCount(): number {
        return Object.keys(this.oppedplayers).length;
    }

    /** Gets the list of all operators */
    opList(): string[] {
        return Object.keys(this.oppedplayers);
    }

    // #endregion
    
    // #region saving

    /** Loads the operators list from the save */
    load(): void {
        if(!this.game.fileManager.fileExists("oplist")) return;

        const rawdata = this.game.fileManager.readFile("oplist");
        if(!rawdata) return;
        if(rawdata.length == 0 || rawdata.trim() === "") return;

        const data = rawdata.split("\n");

        for(const username of data){
            this.oppedplayers[username] = true;
        }
    }

    /** Saves the operators list to file */
    save(): void {
        let data = "";

        for (const key of Object.keys(this.oppedplayers)) {
            data += key + "\n";
        }

        if(data.length > 0) data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("oplist", data);
    }

    // #endregion
}

export default OpManager;