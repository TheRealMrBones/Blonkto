import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

import ServerConfig from "../../configs/server.js";
const { ALLOW_CHANGE_NAME } = ServerConfig.PLAYER;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
];

export default (): void => {
    if(ALLOW_CHANGE_NAME)
        CommandRegistry.register(new CommandDefinition("nick", false, args, nickCommand, "Changes your name or another players"));
};

function nickCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    // special op checks
    if((argIndex == 1 && !game.playerManager.opManager.isOp(player.getUsername())) || (argIndex == 0 && !game.playerManager.opManager.isOp(player.getUsername()) && !ALLOW_CHANGE_NAME)){
        CommandDefinition.sendNoPermission(player, game);
        return;
    }

    // actually run command
    switch(argIndex){
        case 0: {
            if(player.getUsername() === args[1]){
                game.chatManager.sendMessageTo(player, `your name is already ${player.getUsername()}`);
            }else{
                const newusername = game.playerManager.getUsername(args[1]);
                game.chatManager.sendMessageTo(player, `${newusername} is your new name`);
                player.setUsername(newusername);
            }
            break;
        };
        case 1: {
            const p: Player = args[1];
            if(p.getUsername() === args[2]){
                game.chatManager.sendMessageTo(player, `their name is already ${p.getUsername()}`);
            }else{
                const newusername = game.playerManager.getUsername(args[2]);
                game.chatManager.sendMessageTo(player, `${newusername} is ${p.getUsername()}'s new name`);
                game.chatManager.sendMessageTo(p, `you have been renamed to ${newusername}`);
                p.setUsername(newusername);
            }
            break;
        };
    }
}
