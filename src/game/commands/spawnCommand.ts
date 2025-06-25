import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
import EntityRegistry from "../registries/entityRegistry.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.PLAYER],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT],
];

export default (): void => CommandRegistry.register("spawn", new CommandDefinition(true, args, spawnCommand, "Spawns an entity"));

function spawnCommand(args: any[], player: Player, game: Game){
    if(!EntityRegistry.has(args[1])){
        game.chatManager.sendMessageTo(player, `no entity of name: ${args[1]}`);
        return;
    }

    const argIndex = args[0];
    let x = 0, y = 0;

    switch(argIndex){
        case 0: {
            x = player.x;
            y = player.y;
            break;
        }
        case 1: {
            const p: Player = args[2];
            x = p.x;
            y = p.y;
            break;
        }
        case 2: {
            x = args[2] + .5;
            y = args[3] + .5;
            break;
        }
    }

    const entity = new NonplayerEntity(x, y, 0, args[1]);
    game.entities[entity.id] = entity;
    game.chatManager.sendMessageTo(player, `spawned ${args[1]} at: ${Math.floor(x)}, ${Math.floor(y)}`);
}