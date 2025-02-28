import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("oplist", new Command(true, args, opListCommand, "Gets the full list of opped players"));

function opListCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "op list:");
    for(const username of game.opManager.opList()){
        game.chatManager.sendMessageTo(player, `- ${username}`);
    }
}