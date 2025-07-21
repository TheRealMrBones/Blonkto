import { Socket } from "socket.io-client";

import Logger from "../../server/logging/logger.js";
import Game from "../game.js";
import BanManager from "./banManager.js";
import OpManager from "./opManager.js";
import WhitelistManager from "./whitelistManager.js";
import Player from "../objects/player.js";
import { filterText } from "../../shared/filter.js";
import { FailedConnectionContent, PlayerInstantiatedContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { KILLS_TAB } = SharedConfig.TAB;
const { SHOW_TAB } = SharedConfig.TAB;

import ServerConfig from "../../configs/server.js";
const { WHITELIST_ENABLED, OP_BYPASS_WHITELIST } = ServerConfig.WHITELIST;
const { AUTOSAVE_RATE } = ServerConfig.WORLD;
const { FILTER_USERNAME, ALLOW_MULTI_LOGON } = ServerConfig.PLAYER;

/** Manages the list of players for the server */
class PlayerManager {
    private readonly logger: Logger;

    private readonly game: Game;

    readonly banManager: BanManager;
    readonly opManager: OpManager;
    readonly whitelistManager: WhitelistManager;

    private readonly saveinterval: NodeJS.Timeout;
    private readonly recentlogons: { username: string, time: number }[] = [];

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.PLAYER_MANAGER);

        this.game = game;
        
        this.banManager = new BanManager(game);
        this.opManager = new OpManager(game);
        this.whitelistManager = new WhitelistManager(game);

        this.saveinterval = setInterval(this.savePlayers.bind(this), 1000 * AUTOSAVE_RATE);
    }

    // #region player management

    /** Creates a player for the given user and adds them to the world */
    addPlayer(socket: Socket, username: string): void {
        if(socket.id === undefined) return;

        // update recent logons
        const now = Date.now();
        if(this.recentlogons.some(logon => logon.username === username)){
            const index = this.recentlogons.findIndex(logon => logon.username === username);
            this.recentlogons[index].time = now;
            this.recentlogons.sort((a, b) => b.time - a.time);
        }else{
            if(this.recentlogons.length >= 10) this.recentlogons.pop();
            this.recentlogons.unshift({ username, time: now });
        }

        // check if banned or not whitelisted
        if(this.banManager.isBanned(username)){
            const content: FailedConnectionContent = { reason: "Banned", extra: this.banManager.banReason(username) };
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, content);
            this.logger.log(`${username} tried to log in but is banned`);
            return;
        }else if(WHITELIST_ENABLED && !this.whitelistManager.isWhitelisted(username) && !(OP_BYPASS_WHITELIST && this.opManager.isOp(username))){
            const content: FailedConnectionContent = { reason: "Not Whitelisted", extra: "" };
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, content);
            this.logger.log(`${username} tried to log in but is not whitelisted`);
            return;
        }else if(!ALLOW_MULTI_LOGON && [...this.game.entityManager.getPlayerEntities()].some(p => p.username == username)){
            const content: FailedConnectionContent = { reason: "User already logged in on another instance", extra: "" };
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, content);
            this.logger.log(`${username} tried to log in but is already logged in on another instance`);
            return;
        }

        // clean username
	    username = this.getUsername(username);

        // get spawn pos
        const spawn = this.game.world.getSpawn();

        if(this.game.fileManager.fileExists(getPlayerFilePath(username))){
            // load existing player from data
            const data = this.game.fileManager.readFile(getPlayerFilePath(username));
            if(!data) return;
            spawn.layer.entityManager.addPlayer(Player.readFromSave(socket, spawn.layer, spawn.pos.x, spawn.pos.y, JSON.parse(data)));
        }else{
            // create new player
            spawn.layer.entityManager.addPlayer(new Player(socket, username, spawn.layer, spawn.pos.x, spawn.pos.y, true));
        }
        
        // send info to client
        const player = this.game.entityManager.getPlayer(socket.id)!;
        player.socket.emit(MSG_TYPES.GAME_UPDATE, this.game.createInitialUpdate(player));
        const content: PlayerInstantiatedContent = {
            x: player.x,
            y: player.y,
            color: player.color,
        };
        socket.emit(MSG_TYPES.PLAYER_INSTANTIATED, content);

        // log in chat
        this.game.chatManager.sendMessage(`${username} has connected`);
    }

    /** Saves the given player to their own file */
    savePlayer(player: Player): void {
        const data = player.serializeForWrite();

        this.game.fileManager.writeFile(getPlayerFilePath(player.username), data);
    }

    /** Deletes the given player from the world and removes their save file */
    deletePlayer(player: Player): void {
        if(this.game.fileManager.fileExists(getPlayerFilePath(player.username)))
            this.game.fileManager.deleteFile(getPlayerFilePath(player.username));

        this.game.entityManager.removePlayer(player.id);
    }

    /** Kills the given player and saves their post death data */
    killPlayer(socket: Socket, killedby: string): void {
        if(socket.id === undefined) return;

        const player = this.game.entityManager.getPlayer(socket.id)!;

        this.game.chatManager.sendMessage(`${player.username} was killed by ${killedby}`);
        
        socket.emit(MSG_TYPES.DEAD);

        const data = player.serializeAfterKilled();

        this.game.fileManager.writeFile(getPlayerFilePath(player.username), data);

        this.game.entityManager.removePlayer(player.id);
    }

    /** Removes the player from the world and saves their data */
    removePlayer(socket: Socket): void {
        if(socket.id === undefined) return;

        const player = this.game.entityManager.getPlayer(socket.id)!;

        if(player != null){
            this.game.chatManager.sendMessage(`${player.username} has disconnected`);

            this.savePlayer(player);

            this.game.entityManager.removePlayer(player.id);
        }
    }

    /** Saves all players to their own files */
    savePlayers(): void {
        for(const p of this.game.entityManager.getPlayerEntities()){
            this.savePlayer(p);
        }
    }

    /** Returns the player with the given username if they exist */
    getPlayerByUsername(username: string): Player | undefined {
        return [...this.game.entityManager.getPlayerEntities()].find(p => (p as Player).username.toLowerCase() == username.toLowerCase());
    }

    // #endregion

    // #region misc getters

    /** Gets the cleaned username for a new/renamed player */
    getUsername(username: string): string {
        let newUsername = FILTER_USERNAME ? filterText(username.replace(/\s+/g, "")) : username.replace(/\s+/g, "");
        if(newUsername.trim().length === 0) newUsername = "SillyGoose";

        const playerlist = [...this.game.entityManager.getPlayerEntities()];
    
        if(playerlist.some(e => e.username === newUsername)){
            let done = false;
            for(let i = 2; !done; i++){
                if(!playerlist.some(e => e.username === newUsername + `${i}`)){
                    done = true;
                    newUsername += `${i}`;
                }
            }
        }
        return newUsername;
    }

    /** Returns the tab list of current players */
    getTab(): any[] {
        if(!SHOW_TAB) return [];

        return [...this.game.entityManager.getPlayerEntities()].map(p => { 
            const returnobj: any = {
                username: p.username,
            };
            if(KILLS_TAB) returnobj.kills = p.kills;
            return returnobj;
        });
    }

    /** Returns the list of recent logons */
    getRecentLogons(): { username: string, time: number }[] {
        return this.recentlogons;
    }

    // #endregion
}

// #region helpers

/** Gets the save file path for a given player */
const getPlayerFilePath = (username: string): string => ("players/" + username);

// #endregion

export default PlayerManager;
