import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("op", new CommandDefinition(false, args, opCommand, "Gives a player operator permissions"));

function opCommand(args: any[], player: Player, game: Game){
    // special op checks
    if(!game.playerManager.opManager.isOp(player.username) && !(args[1] == game.playerManager.opManager.oppasscode && !game.playerManager.opManager.oppasscodeused)){
        CommandDefinition.sendNoPermission(player, game);
        return;
    }

    // actually run command
    if(args[1] == game.playerManager.opManager.oppasscode && !game.playerManager.opManager.oppasscodeused){
        game.playerManager.opManager.op(player.username);
        game.playerManager.opManager.oppasscodeused = true;
        game.chatManager.sendMessageTo(player, "you are now opped");
    }else{
        const p = game.playerManager.getPlayerByUsername(args[1]);
        const username = p !== undefined ? p.username : args[1];

        if(game.playerManager.opManager.isOp(username)){
            game.chatManager.sendMessageTo(player, `${username} is already opped`);
        }else{
            game.playerManager.opManager.op(username);
            if(p !== undefined) game.chatManager.sendMessageTo(p, "you are now opped");
            game.chatManager.sendMessageTo(player, `opped ${username}`);
        }
    }
}