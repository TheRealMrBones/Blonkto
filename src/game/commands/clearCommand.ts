import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register(new CommandDefinition("clear", true, args, clearCommand, "Clears a players inventory"));

function clearCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0: {
            player.getInventory().clear();
            game.chatManager.sendMessageTo(player, "cleared your inventory");
            break;
        };
        case 1: {
            const p: Player = args[1];
            player.getInventory().clear();
            game.chatManager.sendMessageTo(player, `cleared ${p.getUsername()}'s inventory`);
            break;
        }
    }
}
