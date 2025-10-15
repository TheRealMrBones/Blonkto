import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS, GAME_MODES } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register(new CommandDefinition("gamemode", true, args, gameModeCommand, "Sets the gamemode of a player"));

function gameModeCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const gamemode = argIndex == 0 ? args[1] : args[2];
    if(!Object.values(GAME_MODES).includes(gamemode)){
        game.chatManager.sendMessageTo(player, `invalid gamemode "${gamemode}"`);
        return;
    }

    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, `set your gamemode to ${gamemode}`);
            player.setGamemode(gamemode);
            break;
        };
        case 1: {
            const p: Player = args[1];
            game.chatManager.sendMessageTo(player, `set ${p.getUsername()}'s gamemode to ${gamemode}`);
            p.setGamemode(gamemode);
            break;
        }
    }
}
