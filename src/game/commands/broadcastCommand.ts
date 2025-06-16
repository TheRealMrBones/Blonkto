import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING_LONG],
];

export default (): void => CommandRegistry.register("broadcast", new Command(true, args, broadcastCommand, "Sends a message in the game chat"));

function broadcastCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessage(args[1]);
}