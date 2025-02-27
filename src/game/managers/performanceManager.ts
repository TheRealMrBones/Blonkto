import Game from "../game.js";

import ServerConfig from "../../configs/server.js";
import { Console } from "console";
const { LOG_PERFORMANCE, PERFORMANCE_LOG_RATE } = ServerConfig.PERFORMACE;

/** Manages performance monitoring for the server */
class PerformanceManager {
    game: Game;
    loginterval: NodeJS.Timeout | null;

    tickstarttime: number = 0;
    cummilativetickcount: number = 0;
    cummilativeticktime: number = 0;
    maxticktime: number = 0;

    constructor(game: Game){
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

        console.log(`Performance Log - ${new Date().toLocaleTimeString()}`);
        console.log(`TPS: ${tps.toFixed(3)}, Average Tick Time: ${averageticktime.toFixed(3)}ms, Max Tick Time: ${this.maxticktime.toFixed(3)}ms`);
        console.log(`Ticking Objects: ${players} players, ${entities} entities, ${objects} objects`);

        this.cummilativetickcount = 0;
        this.cummilativeticktime = 0;
        this.maxticktime = 0;
    }

    // #endregion
}

export default PerformanceManager;