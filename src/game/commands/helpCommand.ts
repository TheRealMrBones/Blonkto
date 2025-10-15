import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register(new CommandDefinition("help", false, args, helpCommand, "Gives list of commands or describes a specified command"));

function helpCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const commands = [...CommandRegistry.getAll()]
        .filter(c => !(c.getOp() && !game.playerManager.opManager.isOp(player.getUsername())))
        .sort((a: CommandDefinition, b: CommandDefinition) => a.key.localeCompare(b.key));

    if(argIndex == 0 || argIndex == 1){
        const perpage = 10;
        const pages = Math.ceil(commands.length / perpage);
        const page = argIndex == 1 ? Math.max(Math.min(args[1], pages), 1) : 1;

        game.chatManager.sendMessageTo(player, `command list page ${page}/${pages}:`);

        for(let i = (page - 1) * perpage; i < page * perpage && i < commands.length; i++){
            const command = commands[i];
            game.chatManager.sendMessageTo(player, `- ${command.key} - ${command.getHelp()}`);
        }
    }else{
        if(CommandRegistry.has(args[1])){
            const command = CommandRegistry.get(args[1]);

            if(argIndex == 2){
                game.chatManager.sendMessageTo(player, `${command.key} - ${command.getHelp()}`);
            }else{
                if(args[2] == "args"){
                    game.chatManager.sendMessageTo(player, `args for ${command.key} command:`);
                    for(const args of command.possibleargs){
                        let argsmessage = `- /${command.key}`;

                        for(let i = 1; i < args.length; i++){
                            const arg = args[i];
                            argsmessage += ` [${getArgTypeString(arg)}]`;
                        }

                        game.chatManager.sendMessageTo(player, argsmessage);
                    }
                }else{
                    game.chatManager.sendMessageTo(player, `unknown help modifer "${args[2]}"`);
                }
            }
        }else{
            game.chatManager.sendMessageTo(player, `"${args[1]}" is not a command`);
        }
    }
}

/** Returns the string equivilent of the given arg type */
function getArgTypeString(arg: number): string {
    switch(arg){
        case COMMAND_ARGUMENTS.KEY: {
            return "KEY";
        }
        case COMMAND_ARGUMENTS.STRING: {
            return "STRING";
        }
        case COMMAND_ARGUMENTS.STRING_LONG: {
            return "STRING_LONG";
        }
        case COMMAND_ARGUMENTS.INT: {
            return "INT";
        }
        case COMMAND_ARGUMENTS.FLOAT: {
            return "FLOAT";
        }
        case COMMAND_ARGUMENTS.BOOLEAN: {
            return "BOOLEAN";
        }
        case COMMAND_ARGUMENTS.USERNAME: {
            return "USERNAME";
        }
        case COMMAND_ARGUMENTS.PLAYER: {
            return "PLAYER";
        }
        default: {
            return "UNKNOWN_TYPE";
        }
    }
}
