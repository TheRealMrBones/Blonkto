import { Server as SocketIo } from "socket.io";

import Logger from "../server/logging/logger.js";
import FileManager from "../server/fileManager.js";
import SocketManager from "./managers/socketManager.js";
import PlayerManager from "./managers/playerManager.js";
import EntityManager from "./managers/entityManager.js";
import ChatManager from "./managers/chatManager.js";
import PerformanceManager from "./managers/performanceManager.js";
import CollisionManager from "./managers/collisionManager.js";
import CraftManager from "./managers/craftManager.js";
import Player from "./objects/player.js";
import World from "./world/world.js";
import { GameUpdateContent } from "../shared/messageContentTypes.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../configs/shared.js";
const { FAKE_PING } = SharedConfig.UPDATES;

import ServerConfig from "../configs/server.js";
import SeededRandom from "../shared/random/seededRandom.js";
import PerlinNoise from "../shared/random/perlinNoise.js";
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { IGNORE_MISSED_TICKS } = ServerConfig.PERFORMACE;

const CALCULATED_UPDATE_RATE = 1000 / SERVER_UPDATE_RATE;

/** The main class that manages the game world and the entities in it */
class Game {
    private readonly logger: Logger;

    readonly fileManager: FileManager;
    readonly socketManager: SocketManager;
    readonly playerManager: PlayerManager;
    readonly entityManager: EntityManager;
    readonly chatManager: ChatManager;
    readonly performanceManager: PerformanceManager;
    readonly collisionManager: CollisionManager;
    readonly craftManager: CraftManager;

    readonly world: World;

    private lastupdatetime: number;
    private nextupdatetime: number;
    lifeticks: number = 0;
    starttime: number;

    constructor(io: SocketIo, fileManager: FileManager){
        this.logger = Logger.getLogger(LOG_CATEGORIES.GAME);
        this.logger.info("Initializing game");

        // managers
        this.fileManager = fileManager;
        this.socketManager = new SocketManager(io, this);
        this.playerManager = new PlayerManager(this);
        this.entityManager = new EntityManager(this);
        this.chatManager = new ChatManager(this);
        this.performanceManager = new PerformanceManager(this);
        this.collisionManager = new CollisionManager(this);
        this.craftManager = new CraftManager(this);
        
        // world
        this.world = new World(this);
        this.world.generateSpawn();

        // start ticking
        this.lastupdatetime = Date.now();
        this.starttime = Date.now();
        this.nextupdatetime = Date.now();
        
        this.logger.info("Game initialized");
        this.logger.info("Starting first tick");
        setTimeout(this.tick.bind(this), 1);
    }

    // #region tick/update

    /** Tick the game world and all currently loaded objects */
    tick(): void {
        this.performanceManager.tickStart();
        this.lifeticks++;

        // get delta time
        const now = Date.now();
        const dt = (now - this.lastupdatetime) / 1000;
        this.lastupdatetime = now;

        // schedule next tick based on delay
        this.nextupdatetime += CALCULATED_UPDATE_RATE;
        if(this.nextupdatetime - now >= 0){
            setTimeout(this.tick.bind(this), this.nextupdatetime - now);
        }else{
            if(!IGNORE_MISSED_TICKS) this.logger.warning(`game ticks falling behind! (by: ${now - this.nextupdatetime}ms)`);
            this.nextupdatetime = now;
            setTimeout(this.tick.bind(this), 1);
        }

        // tick world and managers
        const worldloads: {[key: string]: any } = this.world.tick(dt);
        this.entityManager.tick(dt);

        // send fat update packets
        for(const p of this.entityManager.getPlayerEntities()){
            if(FAKE_PING == 0) p.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(now, p, worldloads[p.id]));
            else setTimeout(() =>
                p.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(now, p, worldloads[p.id]))
            , FAKE_PING / 2);
        }

        this.performanceManager.tickEnd();
    }

    /** Create an update object to be sent to the specified players client */
    createUpdate(t: number, player: Player, worldload: any): GameUpdateContent {
        // Get update data
        const me = player.serializeForUpdate();
        const nearbyPlayers = EntityManager.filterToNearby(player, [...player.layer.entityManager.getPlayerEntities()]).map(p => p.serializeForUpdate());
        const nearbyEntities = EntityManager.filterToNearby(player, [...player.layer.entityManager.getNonplayers()]).map(e => e.serializeForUpdate());
        const fixes = player.getFixes();
        const inventoryupdates = player.getInventory().getChanges();
        const stationupdates = player.station !== null ? player.station.serializeForUpdate(player) : null;
        const recipes = this.craftManager.serializeCraftableRecipesForUpdate(player);
        const tab = this.playerManager.getTab();
        const darkness = this.world.getDarknessPercent();
        const tps = this.performanceManager.getTps();

        // reset data
        player.getInventory().resetChanges();
        if(player.station !== null) player.station.clearIsNew(player);

        // return full update object
        const content: GameUpdateContent = {
            t: t,
            lastupdatetime: this.lastupdatetime,
            me: me,
            others: nearbyPlayers,
            entities: nearbyEntities,
            fixes: fixes,
            inventoryupdates: inventoryupdates,
            stationupdates: stationupdates,
            recipes: recipes,
            worldLoad: worldload,
            tab: tab,
            darkness: darkness,
            tps: tps,
        };

        return content;
    }

    /** Creates the initial update for a client before they have been fully loaded */
    createInitialUpdate(player: Player): GameUpdateContent {
        const worldload = this.world.loadPlayerChunks(player);
        return this.createUpdate(Date.now(), player, worldload);
    }

    // #endregion
}

export default Game;
