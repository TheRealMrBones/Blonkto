import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("seed", true, args, seedCommand, "Shows the worlds seed"));

function seedCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, `Seed: ${game.world.seed}`);
}
