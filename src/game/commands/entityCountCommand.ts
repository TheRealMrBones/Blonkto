import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("entitycount", new CommandDefinition(true, args, entityCountCommand, "Gets the amount of entities currently loaded in the world"));

function entityCountCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, game.performanceManager.getEntityCounts());
}