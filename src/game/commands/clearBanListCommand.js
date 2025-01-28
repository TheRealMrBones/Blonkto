const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class ClearBanListCommand extends Command{
    static key = "clearbanlist";
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
                game.banManager.clearBanList();
                this.sendResponse(player, `cleared ban list`);
                
                break;
            };
        }
    }
}

module.exports = ClearBanListCommand;