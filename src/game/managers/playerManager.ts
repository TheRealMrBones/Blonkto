import Game from '../game.js';
import Player from '../objects/player.js';
import { Socket } from 'socket.io-client';
import { filterText } from '../filter.js';

import Constants from '../../shared/constants.js';
const { MSG_TYPES } = Constants;

import ServerConfig from '../../configs/server.js';
const { AUTOSAVE_RATE } = ServerConfig.WORLD;
const { FILTER_USERNAME } = ServerConfig.PLAYER;

class PlayerManager {
    game: Game;
    saveInterval: NodeJS.Timeout;

    constructor(game: Game){
        this.game = game;

        this.saveInterval = setInterval(this.savePlayers.bind(this), 1000 * AUTOSAVE_RATE);
    }

    addPlayer(socket: Socket, username: string){
        if(socket.id === undefined) return;

        // check if banned
        if(this.game.banManager.isBanned(username)){
            socket.emit(MSG_TYPES.CONNECTION_REFUSED, { reason: "Banned", extra: this.game.banManager.banReason(username) });
            return;
        }

        // clean username
	    username = this.getUsername(username);

        // get spawn pos
        let spawn = this.game.world.getSpawn();

        if(this.game.fileManager.fileExists(getPlayerFilePath(username))){
            // load existing player from data
            const data = this.game.fileManager.readFile(getPlayerFilePath(username));
            if(!data) return;
            this.game.players[socket.id] = new Player(socket.id, socket, username, spawn.pos.x, spawn.pos.y, 0, data);
        }else{
            // create new player
            this.game.players[socket.id] = new Player(socket.id, socket, username, spawn.pos.x, spawn.pos.y, 0);
        }
        
        // send info to client
        this.game.players[socket.id].socket.emit(MSG_TYPES.GAME_UPDATE, this.game.createUpdate(this.game.players[socket.id]));
        socket.emit(MSG_TYPES.PLAYER_INSTANTIATED, {
            x: this.game.players[socket.id].x,
            y: this.game.players[socket.id].y,
            color: this.game.players[socket.id].color,
            inventory: this.game.players[socket.id].inventory.map(itemstack => itemstack ? itemstack.serializeForUpdate() : false),
        });

        // log in chat
        this.game.chatManager.sendMessage(`${username} has connected`);
    }

    savePlayer(player: Player){
        const data = player.serializeForWrite();

        this.game.fileManager.writeFile(getPlayerFilePath(player.username), data);
    }

    deletePlayer(player: Player){
        if(this.game.fileManager.fileExists(getPlayerFilePath(player.username)))
            this.game.fileManager.deleteFile(getPlayerFilePath(player.username));

        delete this.game.players[player.id];
    }

    killPlayer(socket: Socket, killedby: string){
        if(socket.id === undefined) return;

        const player = this.game.players[socket.id];

        this.game.chatManager.sendMessage(`${player.username} was killed by ${killedby}`);
        
        socket.emit(MSG_TYPES.DEAD);

        const data = player.serializeAfterKilled();

        this.game.fileManager.writeFile(getPlayerFilePath(player.username), data);

        delete this.game.players[player.id];
    }

    removePlayer(socket: Socket){
        if(socket.id === undefined) return;

        const player = this.game.players[socket.id];

        if(this.game.players[player.id]){
            this.game.chatManager.sendMessage(`${player.username} has disconnected`);

            this.savePlayer(player)

            delete this.game.players[player.id];
        }
    }

    savePlayers(){
        Object.values(this.game.players).forEach(p => {
            this.savePlayer(p);
        })
    }

    getUsername(username: string){
        let newUsername = FILTER_USERNAME ? filterText(username.replace(/\s+/g, '')) : username.replace(/\s+/g, '');
        if(newUsername.trim().length === 0){
            newUsername = "Silly Goose";
        }
    
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

// Get player file path
const getPlayerFilePath = (username: string) => ("players/" + username);

// #endregion

export default PlayerManager;