import Game from "../game.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { PERFORMANCE_LOG_RATE } = ServerConfig.PERFORMACE;
const { LOG_PERFORMANCE } = ServerConfig.LOG;

/** Manages performance monitoring for the server */
class PerformanceManager {
    private logger: Logger;
    private game: Game;
    private loginterval: NodeJS.Timeout | null;

    private tickstarttime: number = 0;
    private cummilativetickcount: number = 0;
    private cummilativeticktime: number = 0;
    private maxticktime: number = 0;

    private lastperformancelog: string[] = ["No Performance Log has been generated recently"];

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

    /** Returns the last performance log as an array of string messages */
    GetLastPerformanceLog(): string[] {
        return this.lastperformancelog;
    }

    // #endregion

    // #region logging

    /** Logs the current performance statistics */
    logPerformance(): void {
        const tps = this.cummilativetickcount / PERFORMANCE_LOG_RATE;
        const averageticktime = this.cummilativeticktime / this.cummilativetickcount;

        const allobjects = this.game.entityManager.getAllObjectCount();
        const players = this.game.entityManager.getPlayerEntityCount();
        const entities = this.game.entityManager.getNonplayerEntityCount();
        const objects = this.game.entityManager.getObjectCount();

        this.lastperformancelog = [
            `Performance Log - ${new Date().toLocaleTimeString()}`,
            `TPS: ${tps.toFixed(3)}, Average Tick Time: ${averageticktime.toFixed(3)}ms, Max Tick Time: ${this.maxticktime.toFixed(3)}ms`,
            `Ticking Objects: ${allobjects} total, ${players} players, ${entities} entities, ${objects} objects`,
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