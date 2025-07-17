import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register(new CommandDefinition("kill", false, args, killCommand, "Kills yourself or another player"));

function killCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];
        
    // special op checks
    if(argIndex == 1 && !game.playerManager.opManager.isOp(player.username)){
        CommandDefinition.sendNoPermission(player, game);
        return;
    }

    // actually run command
    switch(argIndex){
        case 0: {
            player.emitDeathEvent(game, "the Server", null);
            break;
        };
        case 1: {
            const p: Player = args[1];
            p.emitDeathEvent(game, "the Server", null);
            game.chatManager.sendMessageTo(player, `killed ${p.username}`);
            break;
        };
    }
}
