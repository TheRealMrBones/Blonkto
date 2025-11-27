import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register(new CommandDefinition("cycleday", true, args, cycleDayCommand, "Sets whether the day cycle will move or not"));

function cycleDayCommand(args: any[], player: Player, game: Game){
    const toggle = args[1];
    game.world.setCycleDay(toggle);
    game.chatManager.sendMessageTo(player, `set cycle day to: ${toggle}`);
}
