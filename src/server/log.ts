import Constants from "../shared/constants.js";
const { LOG_PRIORITIES, LOG_CATEGORIES, CONSOLE_FORMAT } = Constants;

/** An object representation of a single log line */
class Log {
    message: string;
    time: Date;
    category: string;
    priority: number;

    constructor(message: string, category?: string, priority?: number){
        this.message = message;
        this.time = new Date();
        this.category = category || LOG_CATEGORIES.NONE;
        this.priority = priority || LOG_PRIORITIES.INFO;
    }

    /** Returns the string representation of this log */
    getLine(): string {
        return `[${this.time.toISOString()}] [${this.category}/${this.getPriorityString()}] ${this.message}`;
    }

    /** Returns the string representation of this log with console formatting */
    getLineFormatted(): string {
        return `[${CONSOLE_FORMAT.GREEN}${this.time.toISOString()}${CONSOLE_FORMAT.RESET}] [${CONSOLE_FORMAT.BLUE}${this.category}/${this.getPriorityString()}${CONSOLE_FORMAT.RESET}] ${this.message}`;
    }

    /** Returns the string representation of this logs priority */
    getPriorityString(): string {
        switch(this.priority){
            case LOG_PRIORITIES.INFO: return "INFO";
            case LOG_PRIORITIES.DEBUG: return "DEBUG";
            case LOG_PRIORITIES.WARNING: return "WARNING";
            case LOG_PRIORITIES.ERROR: return "ERROR";
            default: return this.priority.toString();
        }
    }
}

export default Log;