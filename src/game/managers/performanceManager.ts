import Game from "../game.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { PERFORMANCE_LOG_RATE } = ServerConfig.PERFORMACE;
const { LOG_PERFORMANCE } = ServerConfig.LOG;

/** Manages performance monitoring for the server */
class PerformanceManager {
    logger: Logger;
    game: Game;
    loginterval: NodeJS.Timeout | null;

    tickstarttime: number = 0;
    cummilativetickcount: number = 0;
    cummilativeticktime: number = 0;
    maxticktime: number = 0;

    lastperformancelog: string[] = ["No Performance Log has been generated recently"];

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.PERFORMANCE);
        this.game = game;

        this.loginterval = LOG_PERFORMANCE ? setInterval(() => this.logPerformance(), PERFORMANCE_LOG_RATE * 1000) : null;
    }

    // #region calls

    /** Saves the start time of the current tick */
    tickStart(): void {
        this.tickstarttime = performance.now();
    }

    /** Saves the end time of the current ticks and uses it for performance data */
    tickEnd(): void {
        const tickendtime = performance.now();
        const ticktime = tickendtime - this.tickstarttime;

        this.cummilativetickcount++;
        this.cummilativeticktime += ticktime;
        this.maxticktime = Math.max(this.maxticktime, ticktime);
    }

    // #endregion

    // #region logging

    /** Logs the current performance statistics */
    logPerformance(): void {
        const tps = this.cummilativetickcount / PERFORMANCE_LOG_RATE;
        const averageticktime = this.cummilativeticktime / this.cummilativetickcount;

        const players = this.game.getPlayerEntities().length;
        const entities = this.game.getNonplayerEntities().length;
        const objects = this.game.getObjects().length;

        this.lastperformancelog = [
            `Performance Log - ${new Date().toLocaleTimeString()}`,
            `TPS: ${tps.toFixed(3)}, Average Tick Time: ${averageticktime.toFixed(3)}ms, Max Tick Time: ${this.maxticktime.toFixed(3)}ms`,
            `Ticking Objects: ${players} players, ${entities} entities, ${objects} objects`,
        ];

        for(const message of this.lastperformancelog){
            this.logger.info(message);
        }

        this.cummilativetickcount = 0;
        this.cummilativeticktime = 0;
        this.maxticktime = 0;
    }

    // #endregion
}

export default PerformanceManager;