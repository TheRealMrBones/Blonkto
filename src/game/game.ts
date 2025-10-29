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
import { createOneTimeMessage, DarknessContent, OneTimeMessageContent, RecipesContent } from "../shared/oneTimeMessageContentTypes.js";
import { SerializedWorldLoad } from "../shared/serialization/world/SerializedWorldLoad.js";

import Constants from "../shared/constants.js";
const { GAME_MODES, MSG_TYPES, ONE_TIME_MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../configs/shared.js";
const { FAKE_PING } = SharedConfig.UPDATES;

import ServerConfig from "../configs/server.js";
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { AUTOSAVE_RATE, BACKUP_RATE } = ServerConfig.WORLD;
const { IGNORE_MISSED_TICKS } = ServerConfig.PERFORMACE;

const CALCULATED_UPDATE_RATE = 1000 / SERVER_UPDATE_RATE;

import PackageJson from "../../package.json" with { type: "json" };

/** The main class that manages the game world and the entities in it */
class Game {
    private readonly logger: Logger;

    private readonly version: string;
    private readonly oldversion: string;

    readonly fileManager: FileManager;
    readonly socketManager: SocketManager;
    readonly playerManager: PlayerManager;
    readonly entityManager: EntityManager;
    readonly chatManager: ChatManager;
    readonly performanceManager: PerformanceManager;
    readonly collisionManager: CollisionManager;
    readonly craftManager: CraftManager;

    private readonly saveinterval: NodeJS.Timeout;
    private readonly backupinterval: NodeJS.Timeout;

    readonly world: World;

    private lastupdatetime: number;
    private nextupdatetime: number;
    lifeticks: number;
    starttime: number;

    constructor(io: SocketIo, fileManager: FileManager){
        this.logger = Logger.getLogger(LOG_CATEGORIES.GAME);
        this.logger.info("Initializing game");

        // get version
        this.version = PackageJson.version;
        this.logger.info(`Blonkto Version: ${this.version}`);

        // read game save data
        this.fileManager = fileManager;

        if(this.fileManager.fileExists("game")){
            const data: SerializedWriteGame = JSON.parse(this.fileManager.readFile("game")!);

            // handle new verison
            this.oldversion = data.version;
            if(this.oldversion != this.version){
                this.logger.warning(`Save Version: ${data.version} does not match Blonkto Version: ${this.version}`);
            }

            this.lifeticks = data.lifeticks;
        }else{
            this.oldversion = "";
            this.lifeticks = 0;
        }

        // managers
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

        // save global game data
        this.saveGlobalGameData();

        // start ticking
        this.logger.info("Game initialized");
        this.logger.info("Starting first tick");
        setTimeout(this.tick.bind(this), 1);

        // init save and backup intervals
        this.saveinterval = setInterval(this.saveGame.bind(this), 1000 * AUTOSAVE_RATE);
        this.backupinterval = setInterval(this.backupWorld.bind(this), 1000 * 60 * 60 * BACKUP_RATE);
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
        const worldloads: {[key: string]: SerializedWorldLoad } = this.world.tick(dt);
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
    createUpdate(t: number, player: Player, worldload: SerializedWorldLoad): GameUpdateContent {
        const station = player.getStation();

        // Get base update data
        const me = player.serializeForUpdate();
        const nearbyPlayers = EntityManager.filterToNearby(player, [...player.layer.entityManager.getPlayerEntities()])
            .filter(p => p.getGamemode() != GAME_MODES.SPECTATOR)
            .map(p => p.serializeForUpdate());
        const nearbyEntities = EntityManager.filterToNearby(player, [...player.layer.entityManager.getNonplayers()])
            .map(e => e.serializeForUpdate());
        const inventoryupdates = player.getInventory().getChanges();
        const stationupdates = station !== null ? station.serializeForUpdate(player) : null;
        const tab = this.playerManager.getTab();
        const tps = this.performanceManager.getTps();
        const statereset = player.updateStateReset();

        // get one time update data
        const onetimemessages: OneTimeMessageContent[] = [
            ...player.getOneTimeMessages(),
        ];

        const recipes = this.craftManager.serializeCraftableRecipesForUpdate(player);
        if(recipes.length > 0){
            onetimemessages.push(createOneTimeMessage<RecipesContent>(ONE_TIME_MSG_TYPES.RECIPES,
                {
                    recipes: recipes,
                }
            ));
        }

        const darkness = this.world.getDarknessPercent(player.layer.z);
        if(player.updateDarkness(darkness)){
            onetimemessages.push(createOneTimeMessage<DarknessContent>(ONE_TIME_MSG_TYPES.DARKNESS,
                {
                    darkness: darkness,
                }
            ));
        }

        // reset data
        player.getInventory().resetChanges();
        if(station !== null) station.clearIsNew(player);

        // return full update object
        const content: GameUpdateContent = {
            t: t,
            lastupdatetime: this.lastupdatetime,
            me: me,
            others: nearbyPlayers,
            entities: nearbyEntities,
            inventoryupdates: inventoryupdates,
            stationupdates: stationupdates,
            worldLoad: worldload,
            tab: tab,
            tps: tps,
            statereset: statereset,
            onetimemessages: onetimemessages,
        };

        // return final update content
        return content;
    }

    /** Creates the initial update for a client before they have been fully loaded */
    createInitialUpdate(player: Player): GameUpdateContent {
        const worldload = this.world.loadPlayerChunks(player);

        const gameupdate = this.createUpdate(Date.now(), player, worldload);
        gameupdate.darkness = this.world.getDarknessPercent(player.layer.z);

        return gameupdate;
    }

    // #endregion

    // #region serialization

    /** Saves all of the currently loaded world data to the save */
    saveGame(): void {
        this.logger.info("Saving game");

        // save global game data
        this.saveGlobalGameData();

        // saves the world data
        this.world.saveWorld();

        // saves all of the players data
        this.playerManager.savePlayers();

        this.logger.info("Game saved");
    }

    /** Saves the global game data */
    private saveGlobalGameData(): void {
        const gamedata: SerializedWriteGame = {
            lifeticks: this.lifeticks,
            version: this.version,
        };
        this.fileManager.writeFile("game", JSON.stringify(gamedata));
    }

    /** Backs up the currently loaded world to a seperate save */
    backupWorld(): void {
        this.logger.info("Backing up game");

        // save game first
        this.saveGame();

        // create backup directory
        const backupDir = `backups/${Date.now()}`;
        this.fileManager.createDirectory(backupDir);

        // copy data to backup directory
        this.fileManager.copyFile("game", `${backupDir}/game`);
        this.fileManager.copyDirectory("world", `${backupDir}/world`);
        this.fileManager.copyDirectory("players", `${backupDir}/players`);

        this.logger.info("Game backed up");
    }

    // #endregion
}

/** Defines the format for serialized writes of the game */
type SerializedWriteGame = {
    version: string,
    lifeticks: number,
}

export default Game;
