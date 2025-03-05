import fs from "fs";

import Logger from "./logging/logger.js";

import Constants from "../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

const datafolders = [
    "accounts",
    "entities",
    "players",
    "world",
];

/** Manages the creation and reading of save files for the server */
class FileManager {
    logger: Logger
    savelocation: string;
    
    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.FILE_MANAGER);
        this.savelocation = "./data/";

        // initialize data folder
        if(!fs.existsSync(this.savelocation)) fs.mkdirSync(this.savelocation, { recursive: true });
        datafolders.forEach(f => {
            if(!fs.existsSync(this.savelocation + f)) fs.mkdirSync(this.savelocation + f, { recursive: true });
        });
    }

    // #region writing

    /** Writes to (replaces if needed) a file with the given data */
    writeFile(filename: string, content: string): void {
        fs.writeFile(this.getFullFilePath(filename), content, "utf8", (error) => {
            if(error) this.logger.error(`An error occurred while writing to the file: ${error}`);
        });
    }

    /** Deletes the given file from save if it exists */
    deleteFile(filename: string): void | false {
        try{
            fs.unlinkSync(this.getFullFilePath(filename));
        } catch (error) {
            this.logger.error(`An error occurred while deleting the file: ${error}`);
            return false;
        }
    }

    // #endregion

    // #region reading

    /** Returns if the given file exists in the save */
    fileExists(filename: string): boolean {
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), "utf8");
            return true;
        } catch (error) {
            // Don't return error this is expected!
            return false;
        }
    }

    /** Returns the data in the given file if it exists */
    readFile(filename: string): string | false {
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename), "utf8");
            return data;
        } catch (error) {
            this.logger.error(`An error occurred while reading the file: ${error}`);
            return false;
        }
    }

    // #endregion

    // #region helpers

    /** Gets the full file path of the given relative path */
    getFullFilePath(filename: string): string {
        return this.savelocation + filename + ".data";
    }

    // #endregion
}

export default FileManager;