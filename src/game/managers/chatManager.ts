import crypto from "crypto";
import { Socket } from "socket.io-client";

import Game from "../game.js";
import Player from "../objects/player.js";
import { filterText } from "../../shared/filter.js";
import { ExcecuteCommand } from "../commands/commands.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES } = Constants;

import ServerConfig from "../../configs/server.js";
const { FILTER_CHAT } = ServerConfig.CHAT;

/** Manages chat storage and interaction for the server */
class ChatManager {
    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    // #region inputs

    /** Handles a chat message from a player */
    chat(socket: Socket, message: any): void {
        if(socket.id === undefined) return;

        const text = FILTER_CHAT ? filterText(message.text.trim()) : message.text.trim();
        if(text.length == 0){
            // empty message
        }else if(text[0] == "/"){
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

    /** Sends a message to all players */
    sendMessage(text: string): void {
        const message = this.createMessage(text);

        Object.values(this.game.players).forEach(player => {
            player.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
        });
    }

    /** Sends a message to a specific player */
    sendMessageTo(player: Player, text: string): void {
        const message = this.createMessage(text);
        player.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
    }

    // #endregion

    // #region helpers

    /** Creates a chat message object with the given text */
    createMessage(text: string): ChatMessage {
        return {
            text: text,
            id: crypto.randomUUID(),
        };
    }

    // #endregion
}

type ChatMessage = {
    text: string;
    id: string;
}

export default ChatManager;