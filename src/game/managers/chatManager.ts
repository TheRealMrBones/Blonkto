import crypto from "crypto";
import { Socket } from "socket.io-client";

import Logger from "../../server/logging/logger.js";
import Game from "../game.js";
import Player from "../objects/player.js";
import CommandRegistry from "../registries/commandRegistry.js";
import { filterText } from "../../shared/filter.js";
import { ReceiveMessageContent, SendMessageContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import ServerConfig from "../../configs/server.js";
const { FILTER_CHAT } = ServerConfig.CHAT;
const { LOG_CHAT, LOG_COMMANDS } = ServerConfig.LOG;

/** Manages chat storage and interaction for the server */
class ChatManager {
    private readonly logger: Logger;
    private readonly game: Game;

    constructor(game: Game){
        this.logger = Logger.getLogger(LOG_CATEGORIES.CHAT);
        this.game = game;
    }

    // #region inputs

    /** Handles a chat message from a player */
    chat(socket: Socket, message: SendMessageContent): void {
        if(socket.id === undefined) return;
        const player = this.game.entityManager.players.get(socket.id)!;

        const text = FILTER_CHAT ? filterText(message.text.trim()) : message.text.trim();
        if(text.length == 0){
            // empty message
        }else if(text[0] == "/"){
            // command
            this.excecuteCommand(this.game, player, text.substring(1));
        }else{
            // normal message
            const newText = `<${player.username}> ${text}`;
            this.sendMessage(newText);
        }
    }

    excecuteCommand(game: Game, player: Player, command: string): void {
        if(LOG_COMMANDS) this.logger.info(`[${player.username}] /${command}`);
        
        if(command.length == 0){
            game.chatManager.sendMessageTo(player, "no command given");
            return;
        }
    
        const tokens = command.split(" ");
        const key = tokens[0];
    
        // Find command
        if(CommandRegistry.has(key)){
            CommandRegistry.get(key).execute(tokens, player, game);
        }else{
            game.chatManager.sendMessageTo(player, `command "${key}" not found`);
        }
    }

    // #endregion

    // #region sending

    /** Sends a message to all players */
    sendMessage(text: string): void {
        const message = this.createMessage(text);
        if(LOG_CHAT) this.logger.info(text);

        for(const p of this.game.entityManager.players.values()){
            p.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
        }
    }

    /** Sends a message to a specific player */
    sendMessageTo(player: Player, text: string): void {
        const message = this.createMessage(text);
        if(LOG_CHAT) this.logger.info(`[->${player.username}] ${text}`);

        player.socket.emit(MSG_TYPES.RECEIVE_MESSAGE, message);
    }

    // #endregion

    // #region helpers

    /** Creates a chat message object with the given text */
    createMessage(text: string): ReceiveMessageContent {
        return {
            text: text,
            id: crypto.randomUUID(),
        };
    }

    // #endregion
}

export default ChatManager;
