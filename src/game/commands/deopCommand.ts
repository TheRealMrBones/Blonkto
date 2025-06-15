import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
];

export default (): void => CommandRegistry.register("deop", new Command(true, args, deopCommand, "Takes away a players operator permissions"));

function deopCommand(args: any[], player: Player, game: Game){
    const p: Player = args[1];
    if(game.playerManager.opManager.isOp(p.username)){
        game.playerManager.opManager.deop(p.username);
        game.chatManager.sendMessageTo(p, "you are no longer opped");
        game.chatManager.sendMessageTo(player, `deopped ${p.username}`);
    }else{
        game.chatManager.sendMessageTo(player, `${p.username} is not opped`);
    }
}