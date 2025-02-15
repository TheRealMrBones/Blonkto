import Command from "./command";

import Constants from "../../shared/constants.js";
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
                game.chatManager.sendMessageTo(player, "op list:");
                for(const username of game.opManager.opList()){
                    game.chatManager.sendMessageTo(player, `- ${username}`);
                }
                break;
            };
        }
    }
}

export default OpListCommand;