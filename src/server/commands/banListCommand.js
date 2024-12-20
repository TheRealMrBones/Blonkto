const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class BanListCommand extends Command{
    static key = "banlist";
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
                this.sendResponse(player, `ban list:`);
                for(const username of game.banManager.banList()){
                    this.sendResponse(player, `- ${username}`);
                }
                break;
            };
        }
    }
}

module.exports = BanListCommand;