import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import BlockRegistry from "../registries/blockRegistry.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("setblock", new CommandDefinition(true, args, setBlockCommand, "Sets a cells block"));

function setBlockCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];
    if(argIndex == 0){
        const originalarg = args[1];
        args.pop();
        args.push(Math.floor(player.x), Math.floor(player.y), originalarg);
    }

    if(!BlockRegistry.has(args[3]) && args[3] != "air"){
        game.chatManager.sendMessageTo(player, `no block of name: ${args[3]}`);
        return;
    }

    const cell = game.world.getCell(args[1], args[2], true);
    if(!cell){
        game.chatManager.sendMessageTo(player, "invalid block location");
        return;
    }

    if(args[3] == "air") args[3] = null;
    game.world.setBlock(args[1], args[2], args[3]);
    
    game.chatManager.sendMessageTo(player, `set block ${args[1]}, ${args[2]} to ${args[3]}`);
}