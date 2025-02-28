import Command from "./command.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT ],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.INT, COMMAND_ARGUMENTS.INT ],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER ],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.PLAYER, COMMAND_ARGUMENTS.PLAYER ],
];

export default (): void => CommandRegistry.register("tp", new Command(true, args, tpCommand, "Teleports a player"));

function tpCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    switch(argIndex){
        case 0:
        case 1: {
            let playertoteleport: Player, x, y;
            if(argIndex == 0){
                playertoteleport = player;
                x = args[1];
                y = args[2];
            }else{
                playertoteleport = args[1];
                x = args[2];
                y = args[3];
            }

            playertoteleport.setPos(x + .5, y + .5);
            game.chatManager.sendMessageTo(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${x}, ${y}`);
            break;
        }
        case 2:
        case 3: {
            let playertoteleport: Player, playertoteleportto: Player;
            if(argIndex == 2){
                playertoteleport = player;
                playertoteleportto = args[1];
            }else{
                playertoteleport = args[1];
                playertoteleportto = args[2];
            }

            playertoteleport.setPos(playertoteleportto.x, playertoteleportto.y);
            game.chatManager.sendMessageTo(player, `teleported ${playertoteleport == player ? "" : playertoteleport.username + " "}to ${playertoteleportto.username}`);
            break;
        }
    }
}