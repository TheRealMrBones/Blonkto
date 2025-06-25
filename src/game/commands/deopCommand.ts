import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register("deop", new CommandDefinition(true, args, deopCommand, "Takes away a players operator permissions"));

function deopCommand(args: any[], player: Player, game: Game){
    if(game.playerManager.opManager.isOp(args[1])){
        game.playerManager.opManager.deop(args[1]);

        const p = Object.values(game.players).find(p => (p as Player).username.toLowerCase() == args[1].toLowerCase());
        if(p !== undefined) game.chatManager.sendMessageTo(p, "you are no longer opped");

        game.chatManager.sendMessageTo(player, `deopped ${args[1]}`);
    }else{
        game.chatManager.sendMessageTo(player, `${args[1]} is not opped`);
    }
}