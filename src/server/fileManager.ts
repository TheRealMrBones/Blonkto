import fs from "fs";

import Logger from "./logging/logger.js";

import Constants from "../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

const datadirs = [
    "accounts",
    "players",
    "world",
];

/** Manages the creation and reading of save files for the server */
class FileManager {
    private readonly logger: Logger;
    private readonly defaultlocation: string = "data";
    
    constructor(){
        this.logger = Logger.getLogger(LOG_CATEGORIES.FILE_MANAGER);

        // initialize data folder
        if(!fs.existsSync(this.defaultlocation)) fs.mkdirSync(this.defaultlocation, { recursive: true });
        datadirs.forEach(f => {
            this.createDirectory(f);
        });
    }

    // #region writing

    /** Writes to (replaces if needed) a file with the given data */
    writeFile(filename: string, content: string, location?: string): void {
        fs.writeFile(this.getFullFilePath(filename, location), content, "utf8", (error) => {
            if(error) this.logger.error(`An error occurred while writing to the file: ${error}`);
        });
    }

    /** Deletes the given file from save if it exists */
    deleteFile(filename: string, location?: string): void {
        try{
            fs.unlinkSync(this.getFullFilePath(filename, location));
        } catch (error) {
            this.logger.error(`An error occurred while deleting the file: ${error}`);
        }
    }

    /** Creates a new directory */
    createDirectory(dirname: string, location?: string): void {
        const newdir = this.getFullFolderPath(dirname, location);
        if(!fs.existsSync(newdir)) fs.mkdirSync(newdir, { recursive: true });
    }

    // #endregion

    // #region reading

    /** Returns if the given file exists in the save */
    fileExists(filename: string, location?: string): boolean {
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename, location), "utf8");
            return true;
        } catch (error) {
            // Don't return error this is expected!
            return false;
        }
    }

    /** Returns if the given directory exists in the save */
    directoryExists(dirname: string, location?: string): boolean {
        try {
            const data = fs.statSync(this.getFullFolderPath(dirname, location));
            return data.isDirectory();
        } catch (error) {
            // Don't return error this is expected!
            return false;
        }
    }

    /** Returns the data in the given file if it exists */
    readFile(filename: string, location?: string): string | null {
        try {
            const data = fs.readFileSync(this.getFullFilePath(filename, location), "utf8");
            return data;
        } catch (error) {
            this.logger.error(`An error occurred while reading the file: ${error}`);
            return null;
        }
    }

    /** Returns the list of file names from the requested directory */
    listDirectory(dirname: string, location?: string): string[] {
        try {
            const files = fs.readdirSync(this.getFullFolderPath(dirname, location));
            return files;
        } catch (error) {
            this.logger.error(`An error occurred while reading the directory: ${error}`);
            return [];
        }
    }

    // #endregion

    // #region helpers

    /** Gets the full file path of the given relative path */
    getFullFilePath(filename: string, location?: string): string {
        let path = `./${location !== undefined ? location : this.defaultlocation}/${filename}`;
        if(!path.endsWith(".data") && !path.endsWith(".json")) path += ".data";
        return path;
    }

    /** Gets the full folder path of the given relative path */
    getFullFolderPath(foldername: string, location?: string): string {
        return `./${location !== undefined ? location : this.defaultlocation}/${foldername}`;
    }

    // #endregion
}

export default FileManager;
