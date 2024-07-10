const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

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

        // do command based on what args set used
        switch(argIndex){
            case 0:
            case 1: {
                let playertoteleport, x, y;
                if(argIndex == 0){
                    playertoteleport = player;
                    x = tokens[1];
                    y = tokens[2];
                }else{
                    playertoteleport = tokens[1];
                    x = tokens[2];
                    y = tokens[3];
                }

                playertoteleport.setPos(x + .5, y + .5);
                sendResponse(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${x}, ${y}`);
                break;
            }
            case 2:
            case 3: {
                let playertoteleport, playertoteleportto;
                if(argIndex == 2){
                    playertoteleport = player;
                    playertoteleportto = tokens[1];
                }else{
                    playertoteleport = tokens[1];
                    playertoteleportto = tokens[2];
                }

                playertoteleport.setPos(playertoteleportto.x, playertoteleportto.y);
                sendResponse(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${playertoteleportto.username}`);
                break;
            }
        }
    }
}

module.exports = TpCommand;