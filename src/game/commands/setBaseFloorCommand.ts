import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import FloorRegistry from "../registries/floorRegistry.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("setbasefloor", new CommandDefinition(true, args, setBaseFloorCommand, "Sets a cells base floor"));

function setBaseFloorCommand(args: any[], player: Player, game: Game){
    if(!FloorRegistry.has(args[3]) && args[3] != "air"){
        game.chatManager.sendMessageTo(player, `no floor of name: ${args[3]}`);
        return;
    }

    const cell = game.world.getCell(args[1], args[2], true);
    if(!cell){
        game.chatManager.sendMessageTo(player, "invalid floor location");
        return;
    }

    if(args[3] == "air") args[3] = null;
    game.world.setBaseFloor(args[1], args[2], args[3]);
    
    game.chatManager.sendMessageTo(player, `set base floor ${args[1]}, ${args[2]} to ${args[3]}`);
}