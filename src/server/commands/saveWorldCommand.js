const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

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
        this.sendResponse(player, `saved the world!`);
    }
}

module.exports = SaveWorldCommand;