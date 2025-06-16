import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register("isbanned", new Command(true, args, isBannedCommand, "Checks if a player is banned"));

function isBannedCommand(args: any[], player: Player, game: Game){
    const p: Player = args[1];
    const isbanned = game.playerManager.banManager.isBanned(p.username);
    game.chatManager.sendMessageTo(player, isbanned ? `${p.username} is banned for reason: ${game.playerManager.banManager.banReason(p.username)}` : `${p.username} is not banned`);
}