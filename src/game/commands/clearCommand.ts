import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register("clear", new CommandDefinition(true, args, clearCommand, "Clears a players inventory"));

function clearCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0: {
            player.inventory.clear();
            game.chatManager.sendMessageTo(player, "cleared your inventory");
            break;
        };
        case 1: {
            const p: Player = args[1];
            player.inventory.clear();
            game.chatManager.sendMessageTo(player, `cleared ${p.username}'s inventory`);
            break;
        }
    }
}