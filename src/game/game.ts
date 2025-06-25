import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import Logger from "../server/logging/logger.js";
import FileManager from "../server/fileManager.js";
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
import { ClickContent, CraftContent, DropContent, GameUpdateContent, InputContent, SwapContent } from "../shared/messageContentTypes.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES, MINE_TYPES } = Constants;

import SharedConfig from "../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;
const { FAKE_PING } = SharedConfig.UPDATES;
const { ATTACK_DELAY } = SharedConfig.ATTACK;
const { SHOW_TAB } = SharedConfig.TAB;

import ServerConfig from "../configs/server.js";
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { IGNORE_MISSED_TICKS } = ServerConfig.PERFORMACE;

const CALCULATED_UPDATE_RATE = 1000 / SERVER_UPDATE_RATE;

/** The main class that manages the game world and the entities in it */
class Game {
    private readonly logger: Logger;

    readonly fileManager: FileManager;
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
        this.playerManager = new PlayerManager(this);
        this.entityManager = new EntityManager(this);
        this.chatManager = new ChatManager(this);
        this.performanceManager = new PerformanceManager(this);
        this.collisionManager = new CollisionManager(this);
        this.craftManager = new CraftManager(this);
        
        // world
        this.world = new World(this);

        // prepare socket connections
        io.on("connection", socket => {
            socket.on(MSG_TYPES.INPUT, (content) => { this.handlePlayerInput(socket as any, content); });
            socket.on(MSG_TYPES.CLICK, (content) => { this.handlePlayerClick(socket as any, content); });
            socket.on(MSG_TYPES.INTERACT, (content) => { this.handlePlayerInteract(socket as any, content); });
            socket.on(MSG_TYPES.DROP, (content) => { this.handlePlayerDrop(socket as any, content); });
            socket.on(MSG_TYPES.SWAP, (content) => { this.handlePlayerSwap(socket as any, content); });
            socket.on(MSG_TYPES.CRAFT, (content) => { this.handlePlayerCraft(socket as any, content); });
            socket.on(MSG_TYPES.DISCONNECT, () => { this.playerManager.removePlayer(socket as any); });
            socket.on(MSG_TYPES.SEND_MESSAGE, (content) => { this.chatManager.chat(socket as any, content); });
        });

        // start ticking
        this.lastUpdateTime = Date.now();
        this.starttime = Date.now();
        this.nextUpdateTime = Date.now();
        
        this.logger.info("Game initialized");
        this.logger.info("Starting first tick");
        setTimeout(this.tick.bind(this), 1);
    }

    // #region inputs

    /** Response to the general input message from a client */
    handlePlayerInput(socket: Socket, content: InputContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        if(this.players[socket.id]){
            this.players[socket.id].update(content);
        }
    }

    /** Response to a click (left click) message from a client */
    handlePlayerClick(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - this.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.players[socket.id].inventory.getSlot(this.players[socket.id].hotbarslot);

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.use(this, this.players[socket.id], newinfo)) return;
            }

            // default break action
            const cell = this.world.getCell(newinfo.cellpos.x, newinfo.cellpos.y, false);
            if(cell !== null){
                if(cell.block !== null){
                    if(cell.block.definition.minetype == MINE_TYPES.ANY && cell.block.definition.hardness <= 0){
                        this.world.breakBlock(newinfo.cellpos.x, newinfo.cellpos.y, true);
                        return;
                    }
                }
            }
            
            // default swing action
            this.players[socket.id].startSwing(newinfo.dir, 1);
        }
    }

    /** Response to a interaction (right click) message from a client */
    handlePlayerInteract(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - this.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.players[socket.id].inventory.getSlot(this.players[socket.id].hotbarslot);

            // try to use item
            if(hotbarItem !== null){
                if(!hotbarItem.interact(this, this.players[socket.id], newinfo)) return;
            }

            // default action
            const cell = this.world.getCell(newinfo.cellpos.x, newinfo.cellpos.y, false);
            if(cell === null) return;
            if(cell.block === null) return;
            if(newinfo.dist > BASE_REACH) return;
            cell.block.emitInteractEvent(this, this.players[socket.id], newinfo);
        }
    }

    /** Gets formatted click info from the raw click info in a client click message */
    getClickInfo(content: ClickContent): any {
        return {
            dir: Math.atan2(content.xoffset, content.yoffset),
            cellpos: { x: Math.floor(content.mex + content.xoffset), y: Math.floor(content.mey + content.yoffset) },
            dist: Math.sqrt(content.xoffset * content.xoffset + content.yoffset * content.yoffset),
        };
    }

    /** Response to a drop message from a client */
    handlePlayerDrop(socket: Socket, content: DropContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        this.players[socket.id].dropFromSlot(content.slot, this, content.all ? undefined : 1);
    }

    /** Response to a swap message from a client */
    handlePlayerSwap(socket: Socket, content: SwapContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        this.players[socket.id].inventory.swapSlots(content.slot1, content.slot2);
    }

    /** Response to a craft message from a client */
    handlePlayerCraft(socket: Socket, content: CraftContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        const player = this.players[socket.id];
        this.craftManager.craftRecipe(player.inventory, player.x, player.y, content);
    }

    // #endregion

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
        const recipes: any[] = (this.craftManager.playerHasInitialRecipes(player.id) || inventoryupdates.length > 0) ?
            this.craftManager.serializeCraftableRecipesForUpdate(player.inventory, player.id) : [];

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