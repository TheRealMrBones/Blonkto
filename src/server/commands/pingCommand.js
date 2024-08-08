const Constants = require('../../shared/constants.js');
const Command = require('./command.js');

const { COMMAND_ARGUMENTS } = Constants;

class PingCommand extends Command{
    static key = "ping";
    static op = false;
    static args = [
        [COMMAND_ARGUMENTS.KEY],
    ];

    static execute(game, player, tokens){
        this.sendResponse(player, `pong!`);
    }
}

module.exports = PingCommand;