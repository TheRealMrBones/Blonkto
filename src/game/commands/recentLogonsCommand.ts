import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("recentlogons", true, args, recentLogonsCommand, "Gets the list of recent logons"));

function recentLogonsCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "recent logons:");
    for(const logon of game.playerManager.getRecentLogons()){
        game.chatManager.sendMessageTo(player, `${logon.username} - ${new Date(logon.time).toLocaleString()}`);
    }
}
