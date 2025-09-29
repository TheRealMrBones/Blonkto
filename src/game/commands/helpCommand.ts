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
];

export default (): void => CommandRegistry.register(new CommandDefinition("help", false, args, helpCommand, "Gives list of commands or describes a specified command"));

function helpCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const commands = [...CommandRegistry.getAll()]
        .filter(c => !(c.getOp() && !game.playerManager.opManager.isOp(player.username)))
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
            game.chatManager.sendMessageTo(player, `${command.key} - ${command.getHelp()}`);
        }else{
            game.chatManager.sendMessageTo(player, `"${args[1]}" is not a command`);
        }
    }
}
