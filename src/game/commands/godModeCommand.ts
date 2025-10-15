import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.BOOLEAN],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.BOOLEAN],
];

export default (): void => CommandRegistry.register(new CommandDefinition("godmode", true, args, godModeCommand, "Makes a player invulnerable to damage"));

function godModeCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    const toggle = argIndex == 0 ? args[1] : args[2];
    switch(argIndex){
        case 0: {
            game.chatManager.sendMessageTo(player, `made you ${toggle ? "god mode" : "not god mode"}`);
            player.setGodmode(toggle);
            break;
        };
        case 1: {
            const p: Player = args[1];
            game.chatManager.sendMessageTo(player, `made ${p.getUsername()} ${toggle ? "god mode" : "not god mode"}`);
            p.setGodmode(toggle);
            break;
        }
    }
}
