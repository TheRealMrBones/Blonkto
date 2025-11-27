import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";
import { FailedConnectionContent } from "shared/messageContentTypes.js";

const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME, COMMAND_ARGUMENTS.STRING_LONG],
];

export default (): void => CommandRegistry.register(new CommandDefinition("ban", true, args, banCommand, "Bans a player from the server"));

function banCommand(args: any[], player: Player, game: Game){
    const p = game.playerManager.getPlayerByUsername(args[1]);
    if(args[2] === undefined) args[2] = "";

    if(p !== undefined){
        const content: FailedConnectionContent = {
            reason: "Banned",
            extra: args[2],
        };
        p.socket.emit(MSG_TYPES.BAN, content);

        game.playerManager.banManager.ban(p.getUsername(), args[2]);
        game.playerManager.removePlayer(p.socket);
        game.chatManager.sendMessageTo(player, `banned ${p.getUsername()}`);
    }else{
        if(game.playerManager.banManager.isBanned(args[1])){
            game.chatManager.sendMessageTo(player, `${args[1]} is already banned`);
            return;
        }

        game.playerManager.banManager.ban(args[1], args[2]);
        game.chatManager.sendMessageTo(player, `banned ${args[1]}`);
    }
}
