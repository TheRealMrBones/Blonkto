const Command = require('./command.js');
const OpCommand = require('./opCommand.js');
const DeopCommand = require('./deopCommand.js');
const TpCommand = require('./tpCommand.js');
const PingCommand = require('./pingCommand.js');
const NickCommand = require('./nickCommand.js');
const HelpCommand = require('./helpCommand.js');
const KillCommand = require('./killCommand.js');
const SaveWorldCommand = require('./saveWorldCommand');

exports.ExcecuteCommand = (game, player, command) => {
    if(command.length == 0){
        Command.sendResponse(player, `no command given`);
        return;
    }

    const tokens = command.split(' ');
    const key = tokens[0];

    switch(key){
        case OpCommand.key: { OpCommand.execute(game, player, tokens); break; };
        case DeopCommand.key: { DeopCommand.execute(game, player, tokens); break; };
        case TpCommand.key: { TpCommand.execute(game, player, tokens); break; };
        case PingCommand.key: { PingCommand.execute(game, player, tokens); break; };
        case NickCommand.key: { NickCommand.execute(game, player, tokens); break; };
        case HelpCommand.key: { HelpCommand.execute(game, player, tokens); break; };
        case KillCommand.key: { KillCommand.execute(game, player, tokens); break; };
        case SaveWorldCommand.key: { SaveWorldCommand.execute(game, player, tokens); break; };
        default: { Command.sendResponse(player, `command "${key}" not found`); break; };
    }
}