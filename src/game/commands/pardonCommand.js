const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class PardonCommand extends Command{
    static key = "pardon";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
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
                if(!game.banManager.isBanned(parsedTokens[1])){
                    this.sendResponse(player, `${parsedTokens[1]} isn't banned`);
                    return;
                }

                game.banManager.pardon(parsedTokens[1]);
                this.sendResponse(player, `pardoned ${parsedTokens[1]}`);
                
                break;
            };
        }
    }
}

module.exports = PardonCommand;