import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("kick", new Command(true, args, kickCommand, "Kicks a player from the server"));

function kickCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const p = args[1];

    p.socket.emit(MSG_TYPES.KICK, { reason: "Kicked", extra: argIndex == 0 ? "" : args[2] });
    game.playerManager.removePlayer(p);
    game.chatManager.sendMessageTo(player, `kicked ${p.username}`);
}