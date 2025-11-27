import ServerConfig from "configs/server.js";
import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;
const { DAY_LENGTH, NIGHT_LENGTH } = ServerConfig.WORLD;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("gettime", true, args, getTimeCommand, "Gets what time it is currently in the game world"));

function getTimeCommand(args: any[], player: Player, game: Game){
    const time = game.world.getDayTick();
    const isday = game.world.isDay();
    game.chatManager.sendMessageTo(player, `time: ${isday ? "day" : "night"}, exact: ${time} / ${DAY_LENGTH + NIGHT_LENGTH}`);
}
