import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register("clearoplist", new CommandDefinition(true, args, clearOpListCommand, "Clears the entire list of oppped players"));

function clearOpListCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    if(args[1]){
        game.playerManager.opManager.clearOpList();
        game.chatManager.sendMessageTo(player, "cleared op list (FORCE)");
    }else{
        game.playerManager.opManager.clearOpList(player.username);
        game.chatManager.sendMessageTo(player, "cleared op list");
    }
}
