import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("op", new Command(false, args, opCommand, "Gives a player operator permissions"));

function opCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    // special op checks
    if(!game.playerManager.opManager.isOp(player.username) && !(args[1] == game.playerManager.opManager.oppasscode && !game.playerManager.opManager.oppasscodeused)){
        Command.sendNoPermission(player, game);
        return;
    }
    
    // actually run command
    switch(argIndex){
        case 0: {
            const p: Player = args[1];
            if(game.playerManager.opManager.isOp(p.username)){
                game.chatManager.sendMessageTo(player, `${p.username} is already opped`);
            }else{
                game.playerManager.opManager.op(p.username);
                game.chatManager.sendMessageTo(p, "you are now opped");
                game.chatManager.sendMessageTo(player, `opped ${p.username}`);
            }
            break;
        };
        case 1: {
            game.playerManager.opManager.op(player.username);
            game.playerManager.opManager.oppasscodeused = true;
            game.chatManager.sendMessageTo(player, "you are now opped");
            break;
        }
    }
}