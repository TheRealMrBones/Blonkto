import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register(new CommandDefinition("entitycount", true, args, entityCountCommand, "Gets the amount of entities currently loaded in the world"));

function entityCountCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, game.performanceManager.getEntityCounts());
            break;
        };
        case 1: {
            const definition = args[1];
            const count = [...game.entityManager.getNonplayerEntities()].filter(e => e.definition.key == definition).length;
            game.chatManager.sendMessageTo(player, `Entities of type "${definition}": ${count}`);
            break;
        };
    }
}
