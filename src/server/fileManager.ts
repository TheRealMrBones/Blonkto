import fs from "fs";

import Logger from "./logging/logger.js";

import Constants from "../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

const datadirs = [
    "accounts",
    "players",
    "world",
    "backups",
    "logs",
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
            if(error !== null) this.logger.error(`An error occurred while writing to the file: ${error}`);
        });
    }

    /** Appends to a file with the given data */
    appendFile(filename: string, content: string, location?: string): void {
        fs.appendFile(this.getFullFilePath(filename, location), content, "utf8", (error) => {
            if(error !== null) this.logger.error(`An error occurred while appending to the file: ${error}`);
        });
    }

    /** Copies the given file to the new location */
    copyFile(source: string, destination: string, location?: string): void {
        fs.copyFile(this.getFullFilePath(source, location), this.getFullFilePath(destination, location), (error) => {
            if(error !== null) this.logger.error(`An error occurred while copying the file: ${error}`);
        });
    }

    /** Deletes the given file from save if it exists */
    deleteFile(filename: string, location?: string): void {
        fs.rm(this.getFullFilePath(filename, location), (error) => {
            if(error !== null) this.logger.error(`An error occurred while deleting the file: ${error}`);
        });
    }

    /** Creates a new directory */
    createDirectory(dirname: string, location?: string): void {
        const newdir = this.getFullFolderPath(dirname, location);
        if(!fs.existsSync(newdir)) fs.mkdirSync(newdir, { recursive: true });
    }

    /** Recursivly copies the given directory to the new location */
    copyDirectory(source: string, destination: string, location?: string): void {
        const sourcedir = this.getFullFolderPath(source, location);
        const destdir = this.getFullFolderPath(destination, location);
        fs.cp(sourcedir, destdir, { recursive: true }, (error) => {
            if(error !== null) this.logger.error(`An error occurred while copying the directory: ${error}`);
        });
    }

    /** Deletes the given directory from save if it exists */
    deleteDirectory(dirname: string, location?: string): void {
        fs.rm(this.getFullFolderPath(dirname, location), (error) => {
            if(error !== null) this.logger.error(`An error occurred while deleting the directory: ${error}`);
        });
    }

    // #endregion

    // #region reading

    /** Returns if the given file exists in the save */
    fileExists(filename: string, location?: string): boolean {
        try {
            const data = fs.statSync(this.getFullFilePath(filename, location));
            return data.isFile();
        } catch (error) {
            return false;
        }
    }

    /** Returns if the given directory exists in the save */
    directoryExists(dirname: string, location?: string): boolean {
        try {
            const data = fs.statSync(this.getFullFolderPath(dirname, location));
            return data.isDirectory();
        } catch (error) {
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
