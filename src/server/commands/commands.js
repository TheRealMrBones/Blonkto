const Command = require('./command.js');
const OpCommand = require('./opCommand.js');
const DeopCommand = require('./deopCommand.js');
const OppedCommand = require('./oppedCommand.js');
const OpListCommand = require('./opListCommand.js');
const TpCommand = require('./tpCommand.js');
const PingCommand = require('./pingCommand.js');
const NickCommand = require('./nickCommand.js');
const HelpCommand = require('./helpCommand.js');
const KillCommand = require('./killCommand.js');
const SaveWorldCommand = require('./saveWorldCommand');

const commands = [
    OpCommand,
    DeopCommand,
    OppedCommand,
    OpListCommand,
    TpCommand,
    PingCommand,
    NickCommand,
    HelpCommand,
    KillCommand,
    SaveWorldCommand,
];

exports.ExcecuteCommand = (game, player, command) => {
    if(command.length == 0){
        Command.sendResponse(player, `no command given`);
        return;
    }

    const tokens = command.split(' ');
    const key = tokens[0];

    // Find command
    const c = commands.find(c => c.key == key);
    if(c){
        c.execute(game, player, tokens);
    }else{
        Command.sendResponse(player, `command "${key}" not found`);
    }
}