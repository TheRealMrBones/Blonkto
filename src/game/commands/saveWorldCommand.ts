import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("saveworld", true, args, saveWorldCommand, "Saves the world"));

function saveWorldCommand(args: any[], player: Player, game: Game){
    game.saveGame();
    game.playerManager.savePlayers();
    game.chatManager.sendMessageTo(player, "saved the world!");
}
