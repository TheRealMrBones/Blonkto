import Command from "./command.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

class SaveWorldCommand extends Command{
    static key = "saveworld";
    static op = true;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
    ];

    static execute(game, player, tokens){
        game.world.saveWorld();
        game.playerManager.savePlayers();
        game.chatManager.sendMessageTo(player, "saved the world!");
    }
}

export default SaveWorldCommand;