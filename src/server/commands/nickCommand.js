const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS, ALLOW_CHANGE_NAME } = Constants;

class OpCommand extends Command{
    static key = "nick";
    static op = false; //unique case handled in here
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
    ];

    static execute(game, player, tokens){
        // get parsed tokens (and check for perms)
        const parsedTokens = this.getParsedTokens(game, player, tokens);
        if(!parsedTokens){
            return;
        }
        const argIndex = parsedTokens[0];

        // special op checks
        if((argIndex == 1 && !player.op) || (argIndex == 0 && !player.op && !ALLOW_CHANGE_NAME)){
            this.noPermMessage();
            return;
        }

        // do command based on what args set used
        switch(argIndex){
            case 0: {
                if(player.username === parsedTokens[1]){
                    this.sendResponse(player, `your name is already ${player.username}`);
                }else{
                    const newusername = game.getUsername(parsedTokens[1]);
                    this.sendResponse(player, `${newusername} is your new name`);
                    player.username = newusername;
                }
                break;
            };
            case 1: {
                const p = parsedTokens[1];
                if(p.username === parsedTokens[2]){
                    this.sendResponse(player, `their name is already ${p.username}`);
                }else{
                    const newusername = game.getUsername(parsedTokens[2]);
                    this.sendResponse(player, `${newusername} is ${p.username}'s new name`);
                    this.sendResponse(p, `you have been renamed to ${newusername}`);
                    p.username = newusername;
                }
                break;
            };
        }
    }
}

module.exports = OpCommand;