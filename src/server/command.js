const Constants = require('../shared/constants.js');
const shortid = require('shortid');

exports.ExcecuteCommand = (game, command, player) => {
    const tokens = command.split(' ');

    switch(tokens[0]){
        case "op": {
            // op passcode (one time use for server owner)
            if(tokens[1] == game.oppasscode && !game.oppasscodeused){
                player.op = true;
                game.oppasscodeused = true;
                sendResponse(player, `you are now opped`);
                break;
            }

            if(!player.op){
                sendResponse(player, `you do not have permission to use this command`);
                break;
            }

            const p = Object.values(game.players).find(p => p.username.toLowerCase() == tokens[1].toLowerCase());
            if(p){
                if(p.op){
                    sendResponse(player, `${p.username} is already opped`);
                }else{
                    p.op = true;
                    sendResponse(p, `you are now opped`);
                    sendResponse(player, `opped ${p.username}`);
                }
            }else{
                sendResponse(player, `${tokens[1]} does not exist`);
            }
            break;
        }
        case "deop": {
            if(!player.op){
                sendResponse(player, `you do not have permission to use this command`);
                break;
            }

            const p = Object.values(game.players).find(p => p.username.toLowerCase() == tokens[1].toLowerCase());
            if(p){
                if(p.op){
                    p.op = false;
                    sendResponse(p, `you are no longer opped`);
                    sendResponse(player, `deopped ${p.username}`);
                }else{
                    sendResponse(player, `${p.username} is not opped`);
                }
            }else{
                sendResponse(player, `${tokens[1]} does not exist`);
            }
            break;
        }
        default: {
            sendResponse(player, `unknown command`);
            break;
        }
    }
}

function sendResponse(player, r){
    const message = { text: r, id: shortid(), };
    player.socket.emit(Constants.MSG_TYPES.RECEIVE_MESSAGE, message);
}