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

export default (): void => CommandRegistry.register("damage", new CommandDefinition(true, args, damageCommand, "Makes a player take damage"));

function damageCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const damage = argIndex == 0 ? args[1] : args[2];
    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, `took ${damage} damage`);
            player.takeHit(game, damage, "the game");
            break;
        };
        case 1: {
            const p: Player = args[1];
            game.chatManager.sendMessageTo(player, `made ${p.username} take ${damage} damage`);
            p.takeHit(game, damage, "the game");
            break;
        }
    }
}
