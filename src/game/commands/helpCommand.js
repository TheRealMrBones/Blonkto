const Command = require('./command.js');

import Constants from '../../shared/constants.js';
const { COMMAND_ARGUMENTS } = Constants;

import ServerConfig from '../../configs/server';
const { ALLOW_CHANGE_NAME } = ServerConfig.PLAYER;

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
            this.sendResponse(player, `- clearoplist - clears the entire list of oppped players`);
            this.sendResponse(player, `- tp - teleport a player`);
            this.sendResponse(player, `- kill - kill yourself or another player`);
            this.sendResponse(player, `- nick - change your name or another players`);
            this.sendResponse(player, `- saveworld - saves the world`);
            this.sendResponse(player, `- kick - kick a player from the server`);
            this.sendResponse(player, `- ban - ban a player from the server`);
            this.sendResponse(player, `- pardon - remove a player from the ban list`);
            this.sendResponse(player, `- banlist - get a list of all banned players`);
            this.sendResponse(player, `- clearbanlist - clears the entire list of banned players`);
        }else{
            this.sendResponse(player, `- opped - check if you are opped`);
            if(ALLOW_CHANGE_NAME)
                this.sendResponse(player, `- nick - change your name`);
        }
    }
}

module.exports = HelpCommand;