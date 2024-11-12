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
        this.sendResponse(player, `command list:`);
        this.sendResponse(player, `- help - gives list of commands`);
        this.sendResponse(player, `- ping - pong!`);
        if(game.opManager.isOp(player.username)){
            this.sendResponse(player, `- op - gives a player operator permissions`);
            this.sendResponse(player, `- deop - take away a players operator permissions`);
            this.sendResponse(player, `- opped - check if you or another play is opped`);
            this.sendResponse(player, `- oplist - view the full list of opped players`);
            this.sendResponse(player, `- tp - teleport a player`);
            this.sendResponse(player, `- kill - kill yourself or another player`);
            this.sendResponse(player, `- nick - change your name or another players`);
            this.sendResponse(player, `- saveworld - saves the world`);
        }else{
            this.sendResponse(player, `- opped - check if you are opped`);
            if(Constants.ALLOW_CHANGE_NAME)
                this.sendResponse(player, `- nick - change your name`);
        }
    }
}

module.exports = HelpCommand;