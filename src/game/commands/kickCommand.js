const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS, MSG_TYPES } = Constants;

class KickCommand extends Command{
    static key = "kick";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
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
                
                p.socket.emit(MSG_TYPES.KICK, { reason: "Kicked", extra: "" });
                game.playerManager.unloadPlayer(p);
                this.sendResponse(player, `kicked ${p.username}`);
                
                break;
            };
            case 1: {
                const p = parsedTokens[1];
                
                p.socket.emit(MSG_TYPES.KICK, { reason: "Kicked", extra: parsedTokens[2] });
                game.playerManager.unloadPlayer(p);
                this.sendResponse(player, `kicked ${p.username}`);
                
                break;
            };
        }
    }
}

module.exports = KickCommand;