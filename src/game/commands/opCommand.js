const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class OpCommand extends Command{
    static key = "op";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER],
    ];

    static execute(game, player, tokens){
        // op passcode
        if(tokens[1] == game.oppasscode && !game.oppasscodeused){
            game.opManager.op(player.username)
            game.oppasscodeused = true;
            this.sendResponse(player, `you are now opped`);
            return;
        }

        // get parsed tokens (and check for perms)
        const parsedTokens = this.getParsedTokens(game, player, tokens);
        if(!parsedTokens){
            return;
        }
        const argIndex = parsedTokens[0];

        // do command based on what args set used
        switch(argIndex){
            case 0: {
                const p = parsedTokens[1];
                if(game.opManager.isOp(p.username)){
                    this.sendResponse(player, `${p.username} is already opped`);
                }else{
                    game.opManager.op(p.username)
                    this.sendResponse(p, `you are now opped`);
                    this.sendResponse(player, `opped ${p.username}`);
                }
                break;
            };
        }
    }
}

module.exports = OpCommand;