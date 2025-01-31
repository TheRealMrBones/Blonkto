const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class PingCommand extends Command{
    static key = "ping";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
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
                this.sendResponse(player, `pong!`);
                break;
            };
        }
    }
}

module.exports = PingCommand;