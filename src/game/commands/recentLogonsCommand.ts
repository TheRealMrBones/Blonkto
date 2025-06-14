import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register("recentlogons", new Command(true, args, recentLogonsCommand, "Gets the list of recent logons"));

function recentLogonsCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "recent logons:");
    for(const logon of game.playerManager.getRecentLogons()){
        game.chatManager.sendMessageTo(player, `${logon.username} - ${new Date(logon.time).toLocaleString()}`);
    }
}