import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("help", new CommandDefinition(false, args, helpCommand, "Gives list of commands"));

function helpCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "command list:");

    const commands = CommandRegistry.getAll();
    for(const command of commands){
        if(command.getOp() && !game.playerManager.opManager.isOp(player.username)) continue;
        game.chatManager.sendMessageTo(player, `- ${command.getRegistryKey()} - ${command.getHelp()}`);
    }
}