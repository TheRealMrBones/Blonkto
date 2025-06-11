import Constants from "../../shared/constants.js";
const { LOG_PRIORITIES, LOG_CATEGORIES, CONSOLE_FORMAT } = Constants;

/** An object representation of a single log line */
class Log {
    private message: string;
    private time: Date;
    private category: string;
    private priority: number;

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
        const prioritycolor = this.getPriorityColor();
        return `[${CONSOLE_FORMAT.BLUE}${this.time.toISOString()}${CONSOLE_FORMAT.RESET}] [${prioritycolor}${this.category}/${this.getPriorityString()}${CONSOLE_FORMAT.RESET}] ${this.message}`;
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

    /** Returns the color associated with this logs priority */
    getPriorityColor(): string {
        switch(this.priority){
            case LOG_PRIORITIES.INFO: return CONSOLE_FORMAT.GREEN;
            case LOG_PRIORITIES.DEBUG: return CONSOLE_FORMAT.GREY;
            case LOG_PRIORITIES.WARNING: return CONSOLE_FORMAT.YELLOW;
            case LOG_PRIORITIES.ERROR: return CONSOLE_FORMAT.RED;
            default: return this.priority.toString();
        }
    }

    /** Returns the priority value of this log */
    getPriority(): number {
        return this.priority;
    }
}

export default Log;