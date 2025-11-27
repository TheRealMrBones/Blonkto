import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register(new CommandDefinition("isbanned", true, args, isBannedCommand, "Checks if a player is banned"));

function isBannedCommand(args: any[], player: Player, game: Game){
    const isbanned = game.playerManager.banManager.isBanned(args[1]);
    game.chatManager.sendMessageTo(player, isbanned ? `${args[1]} is banned for reason: ${game.playerManager.banManager.banReason(args[1])}` : `${args[1]} is not banned`);
}
