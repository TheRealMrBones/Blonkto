import { Socket } from "socket.io-client";

import Game from "../game.js";
import Player from "../objects/player.js";
import { filterText } from "../../shared/filter.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES } = Constants;

import ServerConfig from "../../configs/server.js";
const { AUTOSAVE_RATE } = ServerConfig.WORLD;
const { FILTER_USERNAME } = ServerConfig.PLAYER;

/** Manages the list of players for the server */
class PlayerManager {
    game: Game;
    saveInterval: NodeJS.Timeout;

    constructor(game: Game){
        this.game = game;

        this.saveInterval = setInterval(this.savePlayers.bind(this), 1000 * AUTOSAVE_RATE);
    }

    /** Creates a player for the given user and adds them to the world */
    addPlayer(socket: Socket, username: string): void {
        if(socket.id === undefined) return;

        // check if banned
        if(this.game.banManager.isBanned(username)){
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, { reason: "Banned", extra: this.game.banManager.banReason(username) });
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
            this.game.players[socket.id] = Player.readFromSave(socket, spawn.pos.x, spawn.pos.y, JSON.parse(data));
        }else{
            // create new player
            this.game.players[socket.id] = new Player(socket, username, spawn.pos.x, spawn.pos.y, true);
        }
        
        // send info to client
        this.game.players[socket.id].socket.emit(MSG_TYPES.GAME_UPDATE, this.game.createInitialUpdate(this.game.players[socket.id]));
        socket.emit(MSG_TYPES.PLAYER_INSTANTIATED, {
            x: this.game.players[socket.id].x,
            y: this.game.players[socket.id].y,
            color: this.game.players[socket.id].color,
            inventory: this.game.players[socket.id].inventory.serializeForUpdate(),
        });

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

        delete this.game.players[player.id];
    }

    /** Kills the given player and saves their post death data */
    killPlayer(socket: Socket, killedby: string): void {
        if(socket.id === undefined) return;

        const player = this.game.players[socket.id];

        this.game.chatManager.sendMessage(`${player.username} was killed by ${killedby}`);
        
        socket.emit(MSG_TYPES.DEAD);

        const data = player.serializeAfterKilled();

        this.game.fileManager.writeFile(getPlayerFilePath(player.username), data);

        delete this.game.players[player.id];
    }

    /** Removes the player from the world and saves their data */
    removePlayer(socket: Socket): void {
        if(socket.id === undefined) return;

        const player = this.game.players[socket.id];

        if(player != null){
            this.game.chatManager.sendMessage(`${player.username} has disconnected`);

            this.savePlayer(player);

            delete this.game.players[player.id];
        }
    }

    /** Saves all players to their own files */
    savePlayers(): void {
        Object.values(this.game.players).forEach(p => {
            this.savePlayer(p);
        });
    }

    /** Gets the cleaned username for a new/renamed player */
    getUsername(username: string): string {
        let newUsername = FILTER_USERNAME ? filterText(username.replace(/\s+/g, "")) : username.replace(/\s+/g, "");
        if(newUsername.trim().length === 0) newUsername = "Silly Goose";
    
        if(this.game.getPlayerEntities().some(e => e.username === newUsername)){
            let done = false;
            for(let i = 2; !done; i++){
                if(!this.game.getPlayerEntities().some(e => e.username === newUsername + `${i}`)){
                    done = true;
                    newUsername += `${i}`;
                }
            }
        }
        return newUsername;
    }
}

// #region helpers

/** Gets the save file path for a given player */
const getPlayerFilePath = (username: string): string => ("players/" + username);

// #endregion

export default PlayerManager;