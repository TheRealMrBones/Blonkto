import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

import ServerConfig from "../../configs/server.js";
const { DAY_LENGTH, NIGHT_LENGTH } = ServerConfig.WORLD;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("gettime", new CommandDefinition(true, args, getTimeCommand, "Gets what time it is currently in the game world"));

function getTimeCommand(args: any[], player: Player, game: Game){
    const time = game.world.getDayTick();
    const isday = game.world.isDay();
    game.chatManager.sendMessageTo(player, `time: ${isday ? "day" : "night"}, exact: ${time} / ${DAY_LENGTH + NIGHT_LENGTH}`);
}