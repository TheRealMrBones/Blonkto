import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import { FailedConnectionContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME, COMMAND_ARGUMENTS.STRING_LONG],
];

export default (): void => CommandRegistry.register("ban", new CommandDefinition(true, args, banCommand, "Bans a player from the server"));

function banCommand(args: any[], player: Player, game: Game){
    const p = [...game.entityManager.players.values()].find(p => (p as Player).username.toLowerCase() == args[1].toLowerCase());
    if(args[2] === undefined) args[2] = "";

    if(p !== undefined){
        const content: FailedConnectionContent = {
            reason: "Banned",
            extra: args[2],
        };
        p.socket.emit(MSG_TYPES.BAN, content);

        game.playerManager.banManager.ban(p.username, args[2]);
        game.playerManager.removePlayer(p.socket);
        game.chatManager.sendMessageTo(player, `banned ${p.username}`);
    }else{
        if(game.playerManager.banManager.isBanned(args[1])){
            game.chatManager.sendMessageTo(player, `${args[1]} is already banned`);
            return;
        }

        game.playerManager.banManager.ban(args[1], args[2]);
        game.chatManager.sendMessageTo(player, `banned ${args[1]}`);
    }
}