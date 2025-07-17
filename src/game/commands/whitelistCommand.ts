import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.USERNAME],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("whitelist", new CommandDefinition(true, args, whitelistCommand, "Manages the servers player whitelist"));

function whitelistCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];
    
    // actually run command
    switch(args[1] as string){
        case "add": {
            if(argIndex != 0){
                game.chatManager.sendMessageTo(player, "no username given, operation ignored");
                return;
            }

            const p: string = args[2];
            if(game.playerManager.whitelistManager.isWhitelisted(p)){
                game.chatManager.sendMessageTo(player, `${p} is already whitelisted`);
            }else{
                game.playerManager.whitelistManager.whitelist(p, true);
                game.chatManager.sendMessageTo(player, `whitelisted ${p}`);
            }
            break;
        };
        case "remove": {
            if(argIndex != 0){
                game.chatManager.sendMessageTo(player, "no username given, operation ignored");
                return;
            }

            const p: string = args[2];
            if(!game.playerManager.whitelistManager.isWhitelisted(p)){
                game.chatManager.sendMessageTo(player, `${p} is already not whitelisted`);
            }else{
                game.playerManager.whitelistManager.whitelist(p, false);
                game.chatManager.sendMessageTo(player, `removed ${p} from the whitelist`);
            }
            break;
        };
        case "has": {
            if(argIndex != 0){
                game.chatManager.sendMessageTo(player, "no username given, operation ignored");
                return;
            }
            
            const whitelisted = game.playerManager.whitelistManager.isWhitelisted(args[2]);
            game.chatManager.sendMessageTo(player, `${args[2]} is ${whitelisted ? "" : "not "}whitelisted`);
            break;
        };
        case "list": {
            game.chatManager.sendMessageTo(player, "whitelist:");
            for(const username of game.playerManager.whitelistManager.whitelistList()){
                game.chatManager.sendMessageTo(player, `- ${username}`);
            }
            break;
        };
        default: {
            game.chatManager.sendMessageTo(player, `"${args[1]}" is not a whitelist operation`);
            break;
        }
    }
}
