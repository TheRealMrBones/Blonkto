import Command from './command';

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

class BanCommand extends Command{
    static key = "ban";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.STRING],
    ];

    static execute(game, player, tokens){
        // get parsed tokens (and check for perms)
        const parsedTokens = this.getParsedTokens(game, player, tokens);
        if(!parsedTokens){
            return;
        }
        const argIndex = parsedTokens[0];

        // do command based on what args set used
        switch(argIndex){
            case 0: {
                const p = parsedTokens[1];
                
                p.socket.emit(MSG_TYPES.BAN, { reason: "Banned", extra: "" });
                game.banManager.ban(p.username, "");
                game.playerManager.unloadPlayer(p);
                this.sendResponse(player, `banned ${p.username}`);
                
                break;
            };
            case 1: {
                const p = parsedTokens[1];
                
                p.socket.emit(MSG_TYPES.BAN, { reason: "Banned", extra: parsedTokens[2] });
                game.banManager.ban(p.username, parsedTokens[2]);
                game.playerManager.unloadPlayer(p);
                this.sendResponse(player, `banned ${p.username}`);
                
                break;
            };
            case 2: {
                if(game.banManager.isBanned(parsedTokens[1])){
                    this.sendResponse(player, `${parsedTokens[1]} is already banned`);
                    return;
                }

                game.banManager.ban(parsedTokens[1], "");
                this.sendResponse(player, `banned ${parsedTokens[1]}`);
                
                break;
            };
            case 3: {
                if(game.banManager.isBanned(parsedTokens[1])){
                    this.sendResponse(player, `${parsedTokens[1]} is already banned`);
                    return;
                }

                game.banManager.ban(parsedTokens[1], parsedTokens[2]);
                this.sendResponse(player, `banned ${parsedTokens[1]}`);
                
                break;
            };
        }
    }
}

export default BanCommand;