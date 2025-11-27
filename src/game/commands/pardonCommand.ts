import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register(new CommandDefinition("pardon", true, args, pardonCommand, "Removes a player from the ban list"));

function pardonCommand(args: any[], player: Player, game: Game){
    if(!game.playerManager.banManager.isBanned(args[1])){
        game.chatManager.sendMessageTo(player, `${args[1]} isn't banned`);
        return;
    }

    game.playerManager.banManager.pardon(args[1]);
    game.chatManager.sendMessageTo(player, `pardoned ${args[1]}`);
}
