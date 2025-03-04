import FileManager from "./fileManager.js";
import Log from "./log.js";

import Constants from "../shared/constants.js";
const { LOG_PRIORITIES } = Constants;

/** Manages logging for the game server */
class Logger {
    static _Logger: Logger | undefined;
    fileManager: FileManager | undefined;
    logs: Log[];

    private constructor(){
        this.logs = [];

        this.info("Logger Started");
    }

    /** Singleton getter */
    static getLogger(): Logger {
        if(this._Logger !== undefined) return this._Logger;
        return new Logger();
    }

    /** Sets this loggers file manager */
    setFileManager(fileManager: FileManager): Logger {
        this.fileManager = fileManager;
        return this;
    }

    /** Logs the given message */
    log(message: string, category?: string, priority?: number): void {
        const log = new Log(message, category, priority);
        this.logs.push(log);
        console.log(log.getLineFormatted());
    }

    /** Logs the given message as priority level info */
    info(message: string, category?: string): void {
        this.log(message, category, LOG_PRIORITIES.INFO);
    }

    /** Logs the given message as priority level debug */
    debug(message: string, category?: string): void {
        this.log(message, category, LOG_PRIORITIES.DEBUG);
    }

    /** Logs the given message as priority level warning */
    warning(message: string, category?: string): void {
        this.log(message, category, LOG_PRIORITIES.WARNING);
    }

    /** Logs the given message as priority level error */
    error(message: string, category?: string): void {
        this.log(message, category, LOG_PRIORITIES.ERROR);
    }
}

export default Logger;