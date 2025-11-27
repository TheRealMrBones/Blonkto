import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
];

export default (): void => CommandRegistry.register(new CommandDefinition("banlist", true, args, banListCommand, "Gets a list of all banned players"));

function banListCommand(args: any[], player: Player, game: Game){
    game.chatManager.sendMessageTo(player, "ban list:");
    for(const username of game.playerManager.banManager.banList()){
        game.chatManager.sendMessageTo(player, `- ${username}`);
    }
}
