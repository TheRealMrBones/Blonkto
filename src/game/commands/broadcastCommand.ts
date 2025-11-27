import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING_LONG],
];

export default (): void => CommandRegistry.register(new CommandDefinition("broadcast", true, args, broadcastCommand, "Sends a message in the game chat"));

function broadcastCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessage(args[1]);
}
