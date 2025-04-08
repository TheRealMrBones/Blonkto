import crypto from "crypto";
import { Socket } from "socket.io-client";

import Logger from "../server/logging/logger.js";
import FileManager from "../server/fileManager.js";
import AccountManager from "../server/accountManager.js";
import PlayerManager from "./managers/playerManager.js";
import EntityManager from "./managers/entityManager.js";
import OpManager from "./managers/opManager.js";
import BanManager from "./managers/banManager.js";
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
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../configs/shared.js";
const { ATTACK_DELAY } = SharedConfig.ATTACK;
const { CELLS_HORIZONTAL, CELLS_VERTICAL } = SharedConfig.WORLD;
const { SHOW_TAB, KILLS_TAB } = SharedConfig.TAB;

import ServerConfig from "../configs/server.js";
const { SERVER_UPDATE_RATE } = ServerConfig.UPDATE;
const { OP_PASSCODE, OP_PASSCODE_WHEN_OPS } = ServerConfig.OP_PASSCODE;

/** The main class that manages the game world and the entities in it */
class Game {
    logger: Logger;

    fileManager: FileManager;
    accountManager: AccountManager;
    playerManager: PlayerManager;
    entityManager: EntityManager;
    opManager: OpManager;
    banManager: BanManager;
    chatManager: ChatManager;
    performanceManager: PerformanceManager;
    collisionManager: CollisionManager;
    craftManager: CraftManager;

    players: {[key: string]: Player} = {};
    objects: {[key: string]: GameObject} = {};
    entities: {[key: string]: NonplayerEntity} = {};

    world: World;

    lastUpdateTime: number;

    oppasscode: string;
    oppasscodeused: boolean;

    constructor(fileManager: FileManager, accountManager: AccountManager){
        this.logger = Logger.getLogger(LOG_CATEGORIES.GAME);
        this.logger.info("Initializing game");

        // managers
        this.fileManager = fileManager;
        this.accountManager = accountManager;
        this.playerManager = new PlayerManager(this);
        this.entityManager = new EntityManager(this);
        this.opManager = new OpManager(this);
        this.banManager = new BanManager(this);
        this.chatManager = new ChatManager(this);
        this.performanceManager = new PerformanceManager(this);
        this.collisionManager = new CollisionManager(this);
        this.craftManager = new CraftManager(this);
        
        // world
        this.world = new World(this);

        // updates
        this.lastUpdateTime = Date.now();

        // intervals
        setInterval(this.tick.bind(this), 1000 / SERVER_UPDATE_RATE);

        // op passcode (one time use to give owner op)
        this.oppasscode = crypto.randomUUID();
        if(OP_PASSCODE && (this.opManager.opCount() == 0 || OP_PASSCODE_WHEN_OPS)){
            this.oppasscodeused = false;
            this.logger.info(`oppasscode: ${this.oppasscode}`);
        }else{
            this.oppasscodeused = true;
        }

        this.logger.info("Game initialized");
    }

    // #region inputs

    /** Response to the general input message from a client */
    handlePlayerInput(socket: Socket, content: InputContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        
        const { t, dir, dx, dy, hotbarslot } = content;
        if(this.players[socket.id]){
            this.players[socket.id].update({
                dir: dir,
                dx: dx,
                dy: dy,
                t: t,
            });
            this.players[socket.id].hotbarslot = hotbarslot;
        }
    }

    /** Response to a click (left click) message from a client */
    handlePlayerClick(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        
        if(Date.now() - this.players[socket.id].lastattack > ATTACK_DELAY * 1000){
            const hotbarItem = this.players[socket.id].inventory.getSlot(this.players[socket.id].hotbarslot);

            // use the item or run default use case
            if(hotbarItem === null){
                this.players[socket.id].startSwing(newinfo.dir, 1);
            }else{
                hotbarItem.use(this, this.players[socket.id], newinfo);
            }
        }
    }

    /** Response to a interaction (right click) message from a client */
    handlePlayerInteract(socket: Socket, content: ClickContent): void {
        if(socket.id === undefined || this.players[socket.id] === undefined) return;
        const newinfo = this.getClickInfo(content);
        

    }

    /** Gets formatted click info from the raw click info in a client click message */
    getClickInfo(content: ClickContent): any {
        return {
            dir: Math.atan2(content.xoffset, content.yoffset),
            cellpos: { x: Math.floor(content.mex + content.xoffset), y: Math.floor(content.mey + content.yoffset) },
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
        this.craftManager.craftRecipe(player.inventory, player.x, player.y, content.ingredients, content.amount);
    }

    // #endregion

    // #region tick/update

    /** Tick the game world and all currently loaded objects */
    tick(): void {
        this.performanceManager.tickStart();

        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
        // get world updates
        const worldloads: {[key: string]: any } = {};
        this.entityManager.getPlayerEntities().forEach(p => {
            const worldload = this.world.loadPlayerChunks(p);
            p.chunk = worldload.chunk;
            worldloads[p.id] = worldload;
        });

        // tick objects
        this.entityManager.getAllObjects().forEach(o => {
            o.eventEmitter.emit("tick", this, dt);
        });

        // send fat update packets
        this.entityManager.getPlayerEntities().forEach(player => {
            player.socket.emit(MSG_TYPES.GAME_UPDATE, this.createUpdate(player, worldloads[player.id]));
        });

        // reset cell updates in loaded chunks
        this.world.resetCellUpdates();

        this.performanceManager.tickEnd();
    }

    /** Create an update object to be sent to the specified players client */
    createUpdate(player: Player, worldload: any): GameUpdateContent {
        // Get Tab
        let tab = [];
        if(SHOW_TAB){
            tab = this.entityManager.getPlayerEntities().map(p => { 
                const returnobj: any = {
                    username: p.username,
                };
                if(KILLS_TAB) returnobj.kills = p.kills;
                return returnobj;
            });
        }

        // get players
        const nearbyPlayers = this.entityManager.getPlayerEntities().filter(p => p.id != player.id
            && Math.abs(p.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(p.y - player.y) < CELLS_VERTICAL / 2
        );

        // get fixes
        const fixescopy = player.getFixes();
        player.resetFixes();

        // get inventory updates
        const inventoryupdates = player.inventory.getChanges();
        player.inventory.resetChanges();

        // get entities
        const nearbyEntities = this.entityManager.getNonplayers().filter(e =>
            Math.abs(e.x - player.x) < CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < CELLS_VERTICAL / 2
        );

        // get recipes
        let recipes: any[] = [];
        if(this.craftManager.playerHasInitialRecipes(player.id) || inventoryupdates.length > 0)
            recipes = this.craftManager.serializeCraftableRecipesForUpdate(player.inventory, player.id);

        // return full update object
        const content: GameUpdateContent = {
            t: Date.now(),
            me: player.serializeForUpdate(),
            fixes: fixescopy,
            inventoryupdates: inventoryupdates,
            recipes: recipes,
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            entities: nearbyEntities.map(e => e.serializeForUpdate()),
            worldLoad: worldload,
            tab: tab,
        };
        return content;
    }

    /** Creates the initial update for a client before they have been fully loaded */
    createInitialUpdate(player: Player): GameUpdateContent {
        const worldload = this.world.loadPlayerChunks(player);
        player.chunk = worldload.chunk;
        return this.createUpdate(player, worldload);
    }

    // #endregion
}

export default Game;