import { Server as SocketIo } from "socket.io";
import sizeof from "object-sizeof";

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
import NonplayerEntity from "./objects/nonplayerEntity.js";
import GameObject from "./objects/gameObject.js";
import World from "./world/world.js";
import { GameUpdateContent } from "../shared/messageContentTypes.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../configs/shared.js";
const { FAKE_PING } = SharedConfig.UPDATES;
const { SHOW_TAB } = SharedConfig.TAB;

import ServerConfig from "../configs/server.js";
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

    readonly players: {[key: string]: Player} = {};
    readonly objects: {[key: string]: GameObject} = {};
    readonly entities: {[key: string]: NonplayerEntity} = {};

    readonly world: World;

    private lastUpdateTime: number;
    private nextUpdateTime: number;
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
        this.lastUpdateTime = Date.now();
        this.starttime = Date.now();
        this.nextUpdateTime = Date.now();
        
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
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // schedule next tick based on delay
        this.nextUpdateTime += CALCULATED_UPDATE_RATE;
        if(this.nextUpdateTime - now >= 0){
            setTimeout(this.tick.bind(this), this.nextUpdateTime - now);
        }else{
            if(!IGNORE_MISSED_TICKS) this.logger.warning(`game ticks falling behind! (by: ${now - this.nextUpdateTime}ms)`);
            this.nextUpdateTime = now;
            setTimeout(this.tick.bind(this), 1);
        }

        // tick world and managers
        const worldloads: {[key: string]: any } = this.world.tick(dt);
        this.entityManager.tick(dt);

        // send fat update packets
        this.entityManager.getPlayerEntities().forEach(player => {
            if(FAKE_PING == 0) player.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(now, player, worldloads[player.id]));
            else setTimeout(() =>
                player.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(now, player, worldloads[player.id]))
            , FAKE_PING / 2);
        });

        this.performanceManager.tickEnd();
    }

    /** Create an update object to be sent to the specified players client */
    createUpdate(t: number, player: Player, worldload: any): GameUpdateContent {
        // Get update data
        const tab = SHOW_TAB ? this.playerManager.getTab() : [];
        const nearbyPlayers = this.entityManager.getPlayerEntitiesNearby(player);
        const nearbyEntities = this.entityManager.getNonplayersNearby(player);
        const fixescopy = player.getFixes();
        const inventoryupdates = player.inventory.getChanges();
        const recipes: any[] = (this.craftManager.playerHasInitialRecipes(player.id) || inventoryupdates.length > 0 || player.laststation != player.station) ?
            this.craftManager.serializeCraftableRecipesForUpdate(player.inventory, player.station, player.id) : [];

        // return full update object
        const content: GameUpdateContent = {
            t: t,
            lastupdatetime: this.lastUpdateTime,
            me: player.serializeForUpdate(),
            fixes: fixescopy,
            inventoryupdates: inventoryupdates,
            recipes: recipes,
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            entities: nearbyEntities.map(e => e.serializeForUpdate()),
            worldLoad: worldload,
            tab: tab,
            darkness: this.world.darknesspercent,
            tps: this.performanceManager.getTps(),
        };

        // uncomment to check size of packets
        const packetsize = sizeof(content);
        //console.log(packetsize);

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