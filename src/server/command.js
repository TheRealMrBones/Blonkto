const Constants = require('../shared/constants.js');
const shortid = require('shortid');

exports.ExcecuteCommand = (game, command, player) => {
    const tokens = command.split(' ');

    try{
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
                    sendResponse(player, `player ${tokens[1]} does not exist`);
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
                    sendResponse(player, `player ${tokens[1]} does not exist`);
                }
                break;
            }
            case "tp": {
                if(!player.op){
                    sendResponse(player, `you do not have permission to use this command`);
                    break;
                }
    
                let playertoteleport, x, y;
                if(tokens.length == 3){
                    playertoteleport = player;
                    x = parseInt(tokens[1]);
                    y = parseInt(tokens[2]);
                }else{
                    const p = Object.values(game.players).find(p => p.username.toLowerCase() == tokens[1].toLowerCase());
                    if(p){
                        playertoteleport = p;
                        x = parseInt(tokens[2]);
                        y = parseInt(tokens[3]);
                    }else{
                        sendResponse(player, `player ${tokens[1]} does not exist`);
                        break;
                    }
                }
    
                if(x && y){
                    playertoteleport.setPos(x + .5, y + .5);
                    sendResponse(player, `teleported ${playertoteleport.username} to ${x}, ${y}`);
                }else{
                    sendResponse(player, `invalid coordinates`);
                }
    
                break;
            }
            default: {
                sendResponse(player, `unknown command`);
                break;
            }
        }
    }catch(e){
        sendResponse(player, `command failed`);
    }
}

function sendResponse(player, r){
    const message = { text: r, id: shortid(), };
    player.socket.emit(Constants.MSG_TYPES.RECEIVE_MESSAGE, message);
}