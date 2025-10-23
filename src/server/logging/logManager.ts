import FileManager from "../fileManager.js";
import Log from "./log.js";

import Constants from "../../shared/constants.js";
const { LOG_PRIORITIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { LOG_PRIORITY, SAVE_LOGS } = ServerConfig.LOG;

/** Manages logging for the game server */
class LogManager {
    private static _LogManager: LogManager;
    private fileManager: FileManager | undefined;
    private logs: Log[];

    private constructor(){
        this.logs = [];

        this.info("Logger Started");
    }

    // #region management

    /** Returns the singleton object for log manager */
    static getLogManager(): LogManager {
        if(this._LogManager !== undefined) return this._LogManager;
        const logmanager = new LogManager();
        this._LogManager = logmanager;
        return logmanager;
    }

    /** Sets this loggers file manager */
    setFileManager(fileManager: FileManager){
        this.fileManager = fileManager;
    }

    // #endregion

    // #region getters

    /** Returns the given amount of previous logs of the given severity or higher */
    getLogs(amount: number, priority?: number): Log[] {
        priority = priority === undefined ? LOG_PRIORITIES.INFO : priority;
        return this.logs.filter(l => l.getPriority() >= priority).slice(Math.max(this.logs.length - amount, 0));
    }

    // #endregion

    // #region log methods

    /** Logs the given message */
    log(message: string, category?: string, priority?: number): void {
        const log = new Log(message, category, priority);
        this.logs.push(log);

        // print log to console if match or exceed priority
        if(log.getPriority() >= LOG_PRIORITY) console.log(log.getLineFormatted());

        // write to daily log file
        if(SAVE_LOGS) this.writeLogToFile(log);
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

    // #endregion

    // #region file management

    /** Writes the given log to the daily log file */
    writeLogToFile(log: Log): void {
        if(this.fileManager === undefined) return;

        const time = new Date();
        const logfile = `logs/${time.toDateString().replaceAll(" ", "_")}`;

        // create daily log file if it doesn't exist
        if(!this.fileManager.fileExists(logfile)){
            const header = `log started: ${time.toLocaleTimeString()}\n\n`;
            this.fileManager.writeFile(logfile, header);
        }

        // append log to log file
        this.fileManager.appendFile(logfile, `${log.getLine()}\n`);
    }

    // #endregion
}

export default LogManager;
