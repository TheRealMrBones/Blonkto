import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("performance", new Command(true, args, performanceCommand, "Shows the most recent performance log"));

function performanceCommand(args: any[], player: Player, game: Game){
    for(const message of game.performanceManager.GetLastPerformanceLog()){
        game.chatManager.sendMessageTo(player, message);
    }
}