import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import DroppedStack from "game/objects/droppedStack.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import ItemRegistry from "game/registries/itemRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.INT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.INT],
];

export default (): void => CommandRegistry.register(new CommandDefinition("give", true, args, giveCommand, "Gives an item to a player"));

function giveCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    let amount = 1;
    if(argIndex % 2 == 1)
        amount = argIndex == 1 ? args[3] : args[2];
    const item = argIndex < 2 ? args[2] : args[1];

    if(!ItemRegistry.has(item)){
        game.chatManager.sendMessageTo(player, `no item of name: ${item}`);
        return;
    }

    switch(argIndex){
        case 0:
        case 1: {
            const p: Player = args[1];
            const leftover = p.getInventory().collectItem(item, amount);
            if(leftover > 0) DroppedStack.dropManyWithSpread(game, p.layer, p.x, p.y, item, leftover, .3);

            game.chatManager.sendMessageTo(player, `gave ${p.getUsername()} ${amount} ${item}`);
            break;
        };
        case 2:
        case 3: {
            const leftover = player.getInventory().collectItem(item, amount);
            if(leftover > 0) DroppedStack.dropManyWithSpread(game, player.layer, player.x, player.y, item, leftover, .3);

            game.chatManager.sendMessageTo(player, `gave you ${amount} ${item}`);
            break;
        }
    }
}
