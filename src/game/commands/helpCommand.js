import Command from "./command";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

import ServerConfig from "../../configs/server";
const { ALLOW_CHANGE_NAME } = ServerConfig.PLAYER;

class HelpCommand extends Command{
    static key = "help";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
    ];

    static execute(game, player, tokens){
        game.chatManager.sendMessageTo(player, "command list:");
        game.chatManager.sendMessageTo(player, "- help - gives list of commands");
        game.chatManager.sendMessageTo(player, "- ping - pong!");
        if(game.opManager.isOp(player.username)){
            game.chatManager.sendMessageTo(player, "- op - gives a player operator permissions");
            game.chatManager.sendMessageTo(player, "- deop - take away a players operator permissions");
            game.chatManager.sendMessageTo(player, "- opped - check if you or another play is opped");
            game.chatManager.sendMessageTo(player, "- oplist - view the full list of opped players");
            game.chatManager.sendMessageTo(player, "- clearoplist - clears the entire list of oppped players");
            game.chatManager.sendMessageTo(player, "- tp - teleport a player");
            game.chatManager.sendMessageTo(player, "- kill - kill yourself or another player");
            game.chatManager.sendMessageTo(player, "- nick - change your name or another players");
            game.chatManager.sendMessageTo(player, "- saveworld - saves the world");
            game.chatManager.sendMessageTo(player, "- kick - kick a player from the server");
            game.chatManager.sendMessageTo(player, "- ban - ban a player from the server");
            game.chatManager.sendMessageTo(player, "- pardon - remove a player from the ban list");
            game.chatManager.sendMessageTo(player, "- banlist - get a list of all banned players");
            game.chatManager.sendMessageTo(player, "- clearbanlist - clears the entire list of banned players");
        }else{
            game.chatManager.sendMessageTo(player, "- opped - check if you are opped");
            if(ALLOW_CHANGE_NAME)
                game.chatManager.sendMessageTo(player, "- nick - change your name");
        }
    }
}

export default HelpCommand;