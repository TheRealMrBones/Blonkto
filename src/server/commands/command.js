const Constants = require('../../shared/constants.js');
const shortid = require('shortid');

const { COMMAND_ARGUMENTS } = Constants;

class Command{
    static key = "";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
    ];

    static getParsedTokens(game, player, tokens){
        // tokens parsed are the possible args but as they get checked the previous values change to the parsed tokens
        const tokensParsed = [...this.args];
        let error = "Command Failed";

        // do perms check if needed
        if(this.op){
            if(!player.op){
                this.sendResponse(player, "You do not have permission to use this command");
                return false;
            }
        }

        // read inputed tokens to find correct args
        for(let i = 0; tokensParsed.length > 0; i++){
            // end of inputed tokens
            if(tokens.length == i){
                if(tokensParsed.length == 1 && tokensParsed[0].length == i){
                    // correct args!
                    return tokensParsed[0];
                }else{
                    // too few args for available commands
                    error = `incorrect arguments for command: ${this.key}`;
                    break;
                }
            }

            // check each possible arg if next token is valid
            for(let j = 0; j < tokensParsed.length; j++){
                if(tokensParsed[j].length == i){
                    error = `incorrect arguments for command: ${this.key}`;
                    j--;
                    tokensParsed.splice(j, 1);
                    continue;
                }

                switch(tokensParsed[j][i]){
                    case COMMAND_ARGUMENTS.KEY: {
                        // always set first token (key) to the index of the original args (for use in actual command)
                        tokensParsed[j][i] = j;
                        break;
                    }
                    case COMMAND_ARGUMENTS.PLAYER: {
                        const p = Object.values(game.players).find(p => p.username.toLowerCase() == tokens[i].toLowerCase());
                        if(!p){
                            error = `player "${tokens[i]}" does not exist`;
                            j--;
                            tokensParsed.splice(j, 1);
                        }else{
                            tokensParsed[j][i] = p;
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.INT: {
                        const val = parseInt(tokens[i]);
                        if(!val){
                            error = `"${tokens[i]}" is not an integer`;
                            j--;
                            tokensParsed.splice(j, 1);
                        }else{
                            tokensParsed[j][i] = val;
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.FLOAT: {
                        const val = parseFloat(tokens[i]);
                        if(!val){
                            error = `"${tokens[i]}" is not an float`;
                            j--;
                            tokensParsed.splice(j, 1);
                        }else{
                            tokensParsed[j][i] = val;
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.STRING: {
                        tokensParsed[j][i] = tokens[i];
                        break;
                    }
                }
            }
        }

        // if no correct args found send most recent error
        this.sendResponse(player, error);
        return false;
    }

    static sendResponse(player, r){
        const message = { text: r, id: shortid(), };
        player.socket.emit(Constants.MSG_TYPES.RECEIVE_MESSAGE, message);
    }
}

module.exports = Command;