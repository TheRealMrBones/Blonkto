const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class DeopCommand extends Command{
    static key = "deop";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
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
                if(game.opManager.isOp(p.username)){
                    game.opManager.deop(p.username);
                    this.sendResponse(p, `you are no longer opped`);
                    this.sendResponse(player, `deopped ${p.username}`);
                }else{
                    this.sendResponse(player, `${p.username} is not opped`);
                }
                break;
            };
        }
    }
}

module.exports = DeopCommand;