import LogManager from "./logManager";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

/** A logger that explicitly works for a single category */
class Logger {
    private static _LogManager: LogManager = LogManager.getLogManager();
    private static _Loggers: {[key: string]: Logger} = {};
    category: string;

    private constructor(category?: string){
        this.category = category || LOG_CATEGORIES.NONE;
    }

    /** Returns the singleton object for logger of the requested category */
    static getLogger(category?: string): Logger {
        const categorystring = category || LOG_CATEGORIES.NONE
        if(this._Loggers[categorystring] !== undefined) return this._Loggers[categorystring];
        const logger = new Logger(category);
        this._Loggers[categorystring] = logger;
        return logger;
    }

    /** Logs the given message */
    log(message: string, priority?: number): void {
        Logger._LogManager.log(message, this.category, priority);
    }

    /** Logs the given message as priority level info */
    info(message: string): void {
        Logger._LogManager.info(message, this.category);
    }

    /** Logs the given message as priority level debug */
    debug(message: string): void {
        Logger._LogManager.debug(message, this.category);
    }

    /** Logs the given message as priority level warning */
    warning(message: string): void {
        Logger._LogManager.warning(message, this.category);
    }

    /** Logs the given message as priority level error */
    error(message: string): void {
        Logger._LogManager.error(message, this.category);
    }
}

export default Logger;