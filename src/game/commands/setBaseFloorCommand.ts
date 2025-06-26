import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import FloorRegistry from "../registries/floorRegistry.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register("setbasefloor", new CommandDefinition(true, args, setBaseFloorCommand, "Sets a cells base floor"));

function setBaseFloorCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];
    if(argIndex == 0){
        const originalarg = args[1];
        args.pop();
        args.push(Math.floor(player.x), Math.floor(player.y), originalarg);
    }

    let val = argIndex == 2 ? args[5] : args[3];
    if(!FloorRegistry.has(val) && val != "air"){
        game.chatManager.sendMessageTo(player, `no floor of name: ${val}`);
        return;
    }
    if(val == "air") val = null;

    if(argIndex < 2){
        const cell = game.world.getCell(args[1], args[2], true);
        if(!cell){
            game.chatManager.sendMessageTo(player, "invalid floor location");
            return;
        }

        game.world.setBaseFloor(args[1], args[2], val);
        
        game.chatManager.sendMessageTo(player, `set base floor ${args[1]}, ${args[2]} to ${val}`);
    }else{
        const startx = Math.min(args[1], args[3]);
        const endx = Math.max(args[1], args[3]);
        const starty = Math.min(args[2], args[4]);
        const endy = Math.max(args[2], args[4]);

        for(let x = startx; x < endx; x++){
            for(let y = starty; y < endy; y++){
                const cell = game.world.getCell(x, y, true);
                if(!cell){
                    game.chatManager.sendMessageTo(player, "invalid floor location");
                    return;
                }

                game.world.setBaseFloor(x, y, val);
            }
        }

        game.chatManager.sendMessageTo(player, `set base floors from (${startx}, ${starty}) to (${endx}, ${endy}) to ${val}`);
    }
}