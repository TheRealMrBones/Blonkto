const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class HelpCommand extends Command{
    static key = "help";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
    ];

    static execute(game, player, tokens){
        this.sendResponse(player, `commandList:`);
        this.sendResponse(player, `- help - gives list of commands`);
        this.sendResponse(player, `- ping - pong!`);
        if(player.op){
            this.sendResponse(player, `- nick - change your name or another players`);
            this.sendResponse(player, `- op - gives a player operator permissions`);
            this.sendResponse(player, `- deop - take away a players operator permissions`);
            this.sendResponse(player, `- tp - teleport a player`);
            this.sendResponse(player, `- saveworld - saves teh world`);
        }else{
            this.sendResponse(player, `- nick - change your name`);
        }
    }
}

module.exports = HelpCommand;