import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("ping", new Command(false, args, pingCommand, "Pong!"));

function pingCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "pong!");
}