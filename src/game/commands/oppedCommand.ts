import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register(new CommandDefinition("opped", false, args, oppedCommand, "Checks if you or another play is opped"));

function oppedCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    // special op checks
    if(argIndex == 1 && !game.playerManager.opManager.isOp(player.getUsername())){
        CommandDefinition.sendNoPermission(player, game);
        return;
    }

    // actually run command
    switch(argIndex){
        case 0: {
            const isop = game.playerManager.opManager.isOp(player.getUsername());
            game.chatManager.sendMessageTo(player, isop ? "you are opped" : "you are not opped");
            break;
        };
        case 1: {
            const isop = game.playerManager.opManager.isOp(args[1]);
            game.chatManager.sendMessageTo(player, isop ? `${args[1]} is opped` : `${args[1]} is not opped`);
            break;
        };
    }
}
