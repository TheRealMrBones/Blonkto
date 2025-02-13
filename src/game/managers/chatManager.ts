import crypto from 'crypto';

import Game from '../game.js';
import Player from '../objects/player.js';
import { Socket } from 'socket.io-client';
import { filterText } from '../filter.js';

import { ExcecuteCommand } from '../commands/commands.js';

import Constants from '../../shared/constants.js';
const { MSG_TYPES } = Constants;

import ServerConfig from '../../configs/server.js';
const { FILTER_CHAT } = ServerConfig.CHAT;

class ChatManager {
    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    // #region inputs

    chat(socket: Socket, message: any){
        if(socket.id === undefined) return;

        const text = FILTER_CHAT ? filterText(message.text.trim()) : message.text.trim();
        if(text.length == 0){
            // empty message
        }else if(text[0] == '/'){
            // command
            ExcecuteCommand(this.game, this.game.players[socket.id], text.substring(1));
        }else{
            // normal message
            const newText = `<${this.game.players[socket.id].username}> ${text}`;
            this.sendMessage(newText);
        }
    }

    // #endregion

    // #region sending

    sendMessage(text: string){
        const message = this.createMessage(text);

        Object.values(this.game.players).forEach(player => {
            player.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
        });
    }

    sendMessageTo(player: Player, text: string){
        const message = this.createMessage(text);
        player.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
    }

    // #endregion

    // #region helpers

    createMessage(text: string){
        return {
            text: text,
            id: crypto.randomUUID(),
        };
    }

    // #endregion
}

export default ChatManager;