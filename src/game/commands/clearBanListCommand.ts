import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("clearbanlist", true, args, clearBanListCommand, "Clears the entire list of banned players"));

function clearBanListCommand(args: any[], player: Player, game: Game){
    game.playerManager.banManager.clearBanList();
    game.chatManager.sendMessageTo(player, "cleared ban list");
}
