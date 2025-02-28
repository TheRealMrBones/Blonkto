import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register("opped", new Command(false, args, oppedCommand, "Checks if you or another play is opped"));

function oppedCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];
        
    // special op checks
    if(argIndex == 1 && !game.opManager.isOp(player.username)){
        Command.sendNoPermission(player, game);
        return;
    }

    // actually run command
    switch(argIndex){
        case 0: {
            const isop = game.opManager.isOp(player.username);
            game.chatManager.sendMessageTo(player, isop ? "you are opped" : "you are not opped");
            break;
        };
        case 1: {
            const p: Player = args[1];
            const isop = game.opManager.isOp(p.username);
            game.chatManager.sendMessageTo(player, isop ? `${p.username} is opped` : `${p.username} is not opped`);
            break;
        };
    }
}