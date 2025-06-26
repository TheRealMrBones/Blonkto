import CommandDefinition from "../definitions/commandDefinition.js";
import CommandRegistry from "../registries/commandRegistry.js";
import Player from "../objects/player.js";
import Game from "../game.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register("pos", new CommandDefinition(true, args, posCommand, "Gets a players position in the world"));

function posCommand(args: any[], player: Player, game: Game){
    const username = args[1];
    const p = Object.values(game.players).find(p => (p as Player).username.toLowerCase() == username.toLowerCase());

    if(p !== undefined){
        game.chatManager.sendMessageTo(player, `${p.username} is at ${Math.floor(p.x)}, ${Math.floor(p.y)}`);
    }else{
        if(game.fileManager.fileExists(getPlayerFilePath(username))){
            const data = game.fileManager.readFile(getPlayerFilePath(username));
            if(!data) return;
            const parseddata = JSON.parse(data);
            game.chatManager.sendMessageTo(player, `${username} is at ${Math.floor(parseddata.x)}, ${Math.floor(parseddata.y)}`);
        }else{
            game.chatManager.sendMessageTo(player, `${username} has no position data from in this server`);
        }
    }
}

/** Gets the save file path for a given player */
const getPlayerFilePath = (username: string): string => ("players/" + username);