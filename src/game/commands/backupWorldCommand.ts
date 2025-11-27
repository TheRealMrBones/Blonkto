import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("backupworld", true, args, backupWorldCommand, "Backs up the world"));

function backupWorldCommand(args: any[], player: Player, game: Game){
    game.backupWorld();
    game.chatManager.sendMessageTo(player, "backed up the world!");
}
