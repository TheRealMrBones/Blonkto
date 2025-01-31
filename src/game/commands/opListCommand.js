const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class OpListCommand extends Command{
    static key = "oplist";
    static op = true;
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
                this.sendResponse(player, `op list:`);
                for(const username of game.opManager.opList()){
                    this.sendResponse(player, `- ${username}`);
                }
                break;
            };
        }
    }
}

module.exports = OpListCommand;