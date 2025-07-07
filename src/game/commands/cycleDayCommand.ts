import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register("cycleday", new CommandDefinition(true, args, cycleDayCommand, "Sets whether the day cycle will move or not"));

function cycleDayCommand(args: any[], player: Player, game: Game){
    const toggle = args[1];
    game.world.cycleday = toggle;
    game.chatManager.sendMessageTo(player, `set cycle day to: ${toggle}`);
}