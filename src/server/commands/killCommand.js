const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class KillCommand extends Command{
    static key = "kill";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
    ];

    static execute(game, player, tokens){
        // get parsed tokens (and check for perms)
        const parsedTokens = this.getParsedTokens(game, player, tokens);
        if(!parsedTokens){
            return;
        }
        const argIndex = parsedTokens[0];
        
        // special op checks
        if(argIndex == 1 && !player.op){
            this.noPermMessage();
            return;
        }

        // do command based on what args set used
        switch(argIndex){
            case 0: {
                player.dead = true;
                player.killedby = "the Server";
                break;
            };
            case 1: {
                const p = parsedTokens[1];
                p.dead = true;
                p.killedby = "the Server";
                this.sendResponse(player, `killed ${p.username}`);
                break;
            };
        }
    }
}

module.exports = KillCommand;