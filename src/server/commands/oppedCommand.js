const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class OppedCommand extends Command{
    static key = "opped";
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
        if(argIndex == 1 && !game.opManager.isOp(player.username)){
            this.noPermMessage(player);
            return;
        }

        // do command based on what args set used
        switch(argIndex){
            case 0: {
                if(game.opManager.isOp(player.username)){
                    this.sendResponse(player, `you are opped`);
                }else{
                    this.sendResponse(player, `you are not opped`);
                }
                break;
            };
            case 1: {
                const p = parsedTokens[1];
                if(game.opManager.isOp(p.username)){
                    this.sendResponse(player, `${p.username} is opped`);
                }else{
                    this.sendResponse(player, `${p.username} is not opped`);
                }
                break;
            };
        }
    }
}

module.exports = OppedCommand;