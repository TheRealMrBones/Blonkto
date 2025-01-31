const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

class TpCommand extends Command{
    static key = "tp";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT ],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT ],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER ],
        [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.PLAYER ],
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
            case 0:
            case 1: {
                let playertoteleport, x, y;
                if(argIndex == 0){
                    playertoteleport = player;
                    x = parsedTokens[1];
                    y = parsedTokens[2];
                }else{
                    playertoteleport = parsedTokens[1];
                    x = parsedTokens[2];
                    y = parsedTokens[3];
                }

                playertoteleport.setPos(x + .5, y + .5);
                this.sendResponse(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${x}, ${y}`);
                break;
            }
            case 2:
            case 3: {
                let playertoteleport, playertoteleportto;
                if(argIndex == 2){
                    playertoteleport = player;
                    playertoteleportto = parsedTokens[1];
                }else{
                    playertoteleport = parsedTokens[1];
                    playertoteleportto = parsedTokens[2];
                }

                playertoteleport.setPos(playertoteleportto.x, playertoteleportto.y);
                this.sendResponse(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${playertoteleportto.username}`);
                break;
            }
        }
    }
}

module.exports = TpCommand;