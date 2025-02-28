import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("ban", new Command(true, args, banCommand, "Bans a player from the server"));

function banCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0: {
            const p: Player = args[1];
            
            p.socket.emit(MSG_TYPES.BAN, { reason: "Banned", extra: "" });
            game.banManager.ban(p.username, "");
            game.playerManager.removePlayer(p);
            game.chatManager.sendMessageTo(player, `banned ${p.username}`);
            
            break;
        };
        case 1: {
            const p: Player = args[1];
            
            p.socket.emit(MSG_TYPES.BAN, { reason: "Banned", extra: args[2] });
            game.banManager.ban(p.username, args[2]);
            game.playerManager.removePlayer(p);
            game.chatManager.sendMessageTo(player, `banned ${p.username}`);
            
            break;
        };
        case 2: {
            if(game.banManager.isBanned(args[1])){
                game.chatManager.sendMessageTo(player, `${args[1]} is already banned`);
                return;
            }

            game.banManager.ban(args[1], "");
            game.chatManager.sendMessageTo(player, `banned ${args[1]}`);
            
            break;
        };
        case 3: {
            if(game.banManager.isBanned(args[1])){
                game.chatManager.sendMessageTo(player, `${args[1]} is already banned`);
                return;
            }

            game.banManager.ban(args[1], args[2]);
            game.chatManager.sendMessageTo(player, `banned ${args[1]}`);
            
            break;
        };
    }
}