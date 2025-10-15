import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.INT],
];

export default (): void => CommandRegistry.register(new CommandDefinition("heal", true, args, healCommand, "Heals a player's health"));

function healCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const heal = argIndex == 0 ? args[1] : args[2];
    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, `healed ${heal} health`);
            player.heal(heal);
            break;
        };
        case 1: {
            const p: Player = args[1];
            game.chatManager.sendMessageTo(player, `made ${p.getUsername()} heal ${heal} health`);
            p.heal(heal);
            break;
        }
    }
}
