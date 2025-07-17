import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("clearbanlist", true, args, clearBanListCommand, "Clears the entire list of banned players"));

function clearBanListCommand(args: any[], player: Player, game: Game){
    game.playerManager.banManager.clearBanList();
    game.chatManager.sendMessageTo(player, "cleared ban list");
}
