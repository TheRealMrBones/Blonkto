import Game from "../game.js";
import Logger from "../../server/logging/logger.js";

import Constants from "../../shared/constants.js";
const { LOG_CATEGORIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { PERFORMANCE_LOG_RATE } = ServerConfig.PERFORMACE;
const { LOG_PERFORMANCE } = ServerConfig.LOG;

/** Manages performance monitoring for the server */
class PerformanceManager {
    private readonly logger: Logger;
    private readonly game: Game;
    private readonly loginterval: NodeJS.Timeout | null;

    private tickstarttime: number = 0;
    private cummilativetickcount: number = 0;
    private cummilativeticktime: number = 0;
    private maxticktime: number = 0;
    private lastticks: number[] = [];

    private lastperformancelog: string[] = ["No Performance Log has been generated recently"];

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.PERFORMANCE);
        this.game = game;

        this.loginterval = LOG_PERFORMANCE ? setInterval(() => this.logPerformance(), PERFORMANCE_LOG_RATE * 1000) : null;
    }

    // #region getters

    /** Returns the average tps from last second */
    getTps(): number {
        return Math.min(this.lastticks.length, SERVER_UPDATE_RATE);
    }

    /** Returns the last performance log as an array of string messages */
    getLastPerformanceLog(): string[] {
        return this.lastperformancelog;
    }

    /** Returns the entity count message */
    getEntityCounts(): string {
        const allobjects = this.game.entityManager.getAllObjectCount();
        const players = this.game.entityManager.getPlayerEntityCount();
        const entities = this.game.entityManager.getNonplayerEntityCount();
        const objects = this.game.entityManager.getObjectCount();

        return `Ticking Objects: ${allobjects} total, ${players} players, ${entities} entities, ${objects} objects`;
    }

    // #endregion

    // #region calls

    /** Saves the start time of the current tick */
    tickStart(): void {
        this.tickstarttime = performance.now();
        
        this.lastticks.push(this.tickstarttime);
        while(this.tickstarttime - this.lastticks[0] > 1000){
            this.lastticks.shift();
        }
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
        const lifetps = this.game.lifeticks / ((Date.now() - this.game.starttime) / 1000);

        this.lastperformancelog = [
            `Performance Log - ${new Date().toLocaleTimeString()}`,
            `TPS: ${tps.toFixed(3)}, Average Tick Time: ${averageticktime.toFixed(3)}ms, Max Tick Time: ${this.maxticktime.toFixed(3)}ms`,
            `Life Tick: ${this.game.lifeticks}, Life TPS: ${lifetps.toFixed(3)}`,
            this.getEntityCounts(),
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
