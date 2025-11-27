import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("saveworld", true, args, saveWorldCommand, "Saves the world"));

function saveWorldCommand(args: any[], player: Player, game: Game){
    game.saveGame();
    game.chatManager.sendMessageTo(player, "saved the world!");
}
