import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

import ServerConfig from "../../configs/server.js";
const { ALLOW_CHANGE_NAME } = ServerConfig.PLAYER;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
];

export default (): void => {
    if(ALLOW_CHANGE_NAME)
        CommandRegistry.register("nick", new Command(false, args, nickCommand, "Changes your name or another players"));
}

function nickCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    // special op checks
    if((argIndex == 1 && !game.opManager.isOp(player.username)) || (argIndex == 0 && !game.opManager.isOp(player.username) && !ALLOW_CHANGE_NAME)){
        Command.sendNoPermission(player, game);
        return;
    }

    // actually run command
    switch(argIndex){
        case 0: {
            if(player.username === args[1]){
                game.chatManager.sendMessageTo(player, `your name is already ${player.username}`);
            }else{
                const newusername = game.playerManager.getUsername(args[1]);
                game.chatManager.sendMessageTo(player, `${newusername} is your new name`);
                player.username = newusername;
            }
            break;
        };
        case 1: {
            const p = args[1];
            if(p.username === args[2]){
                game.chatManager.sendMessageTo(player, `their name is already ${p.username}`);
            }else{
                const newusername = game.playerManager.getUsername(args[2]);
                game.chatManager.sendMessageTo(player, `${newusername} is ${p.username}'s new name`);
                game.chatManager.sendMessageTo(p, `you have been renamed to ${newusername}`);
                p.username = newusername;
            }
            break;
        };
    }
}