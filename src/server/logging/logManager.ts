import FileManager from "../fileManager.js";
import Log from "./log.js";

import Constants from "../../shared/constants.js";
const { LOG_PRIORITIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { LOG_PRIORITY } = ServerConfig.LOG;

/** Manages logging for the game server */
class LogManager {
    private static _LogManager: LogManager;
    private fileManager: FileManager | undefined;
    logs: Log[];

    private constructor(){
        this.logs = [];

        this.info("Logger Started");
    }

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

    /** Logs the given message */
    log(message: string, category?: string, priority?: number): void {
        const log = new Log(message, category, priority);
        this.logs.push(log);
        if(log.priority >= LOG_PRIORITY) console.log(log.getLineFormatted());
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

export default LogManager;