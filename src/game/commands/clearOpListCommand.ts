import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register(new CommandDefinition("clearoplist", true, args, clearOpListCommand, "Clears the entire list of oppped players"));

function clearOpListCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    if(args[1]){
        game.playerManager.opManager.clearOpList();
        game.chatManager.sendMessageTo(player, "cleared op list (FORCE)");
    }else{
        game.playerManager.opManager.clearOpList(player.getUsername());
        game.chatManager.sendMessageTo(player, "cleared op list");
    }
}
