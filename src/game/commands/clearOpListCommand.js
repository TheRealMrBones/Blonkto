import Command from './command';

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class ClearOpListCommand extends Command{
    static key = "clearoplist";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
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
                game.opManager.clearOpList(player.username);
                this.sendResponse(player, `cleared op list`);
                
                break;
            };
            case 1:{
                if(parsedTokens[1]){
                    game.opManager.clearOpList();
                    this.sendResponse(player, `cleared op list (FORCE)`);
                }else{
                    game.opManager.clearOpList(player.username);
                    this.sendResponse(player, `cleared op list`);
                }
            }
        }
    }
}

export default ClearOpListCommand;