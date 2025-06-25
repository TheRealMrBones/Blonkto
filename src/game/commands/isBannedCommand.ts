import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register("isbanned", new CommandDefinition(true, args, isBannedCommand, "Checks if a player is banned"));

function isBannedCommand(args: any[], player: Player, game: Game){
    const isbanned = game.playerManager.banManager.isBanned(args[1]);
    game.chatManager.sendMessageTo(player, isbanned ? `${args[1]} is banned for reason: ${game.playerManager.banManager.banReason(args[1])}` : `${args[1]} is not banned`);
}