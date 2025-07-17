import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.FLOAT, COMMAND_ARGUMENTS.FLOAT, COMMAND_ARGUMENTS.FLOAT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.FLOAT, COMMAND_ARGUMENTS.FLOAT, COMMAND_ARGUMENTS.FLOAT],
];

export default (): void => CommandRegistry.register("setcolor", new CommandDefinition(true, args, setColorCommand, "Sets a players character color in rgb (1-0 values)"));

function setColorCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const color = argIndex == 0 ? { r: args[1], g: args[2], b: args[3] } : { r: args[2], g: args[3], b: args[4] };
    if(color.r < 0 || color.r > 1 || color.g < 0 || color.g > 1 || color.b < 0 || color.b > 1){
        game.chatManager.sendMessageTo(player, `color values "${color.r} ${color.g} ${color.b}" are not valid aka 1-0`);
        return;
    }

    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, `set color to "${color.r} ${color.g} ${color.b}"`);
            player.setColor(color);
            break;
        };
        case 1: {
            const p: Player = args[1];
            game.chatManager.sendMessageTo(player, `set ${p.username}'s color to "${color.r} ${color.g} ${color.b}"`);
            p.setColor(color);
            break;
        }
    }
}
