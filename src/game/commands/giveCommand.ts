import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import ItemRegistry from "../registries/itemRegistry.js";
import DroppedStack from "../objects/droppedStack.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.INT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.INT],
];

export default (): void => CommandRegistry.register("give", new Command(true, args, giveCommand, "Gives an item to a player"));

function giveCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    let amount = 1;
    if(amount % 2 == 1)
        amount = argIndex == 1 ? args[3] : args[2];
    const item = argIndex == 1 ? args[2] : args[1];

    if(!ItemRegistry.has(item)){
        game.chatManager.sendMessageTo(player, `no item of name: ${item}`);
        return;
    }

    switch(argIndex){
        case 0:
        case 1: {
            const p: Player = args[1];
            const leftover = p.inventory.collectItem(item, amount);
            if(leftover > 0) DroppedStack.dropManyWithSpread(game, p.x, p.y, item, leftover, .3);

            game.chatManager.sendMessageTo(player, `gave ${p.username} ${amount} ${item}`);
            break;
        };
        case 2:
        case 3: {
            const leftover = player.inventory.collectItem(item, amount);
            if(leftover > 0) DroppedStack.dropManyWithSpread(game, player.x, player.y, item, leftover, .3);

            game.chatManager.sendMessageTo(player, `gave you ${amount} ${item}`);
            break;
        }
    }
}