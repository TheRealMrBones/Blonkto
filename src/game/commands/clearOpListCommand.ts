import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register("clearoplist", new Command(true, args, clearOpListCommand, "Clears the entire list of oppped players"));

function clearOpListCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0: {
            game.opManager.clearOpList(player.username);
            game.chatManager.sendMessageTo(player, "cleared op list");
            
            break;
        };
        case 1:{
            if(args[1]){
                game.opManager.clearOpList();
                game.chatManager.sendMessageTo(player, "cleared op list (FORCE)");
            }else{
                game.opManager.clearOpList(player.username);
                game.chatManager.sendMessageTo(player, "cleared op list");
            }
        }
    }
}