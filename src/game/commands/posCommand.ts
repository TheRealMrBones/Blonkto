import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.USERNAME],
];

export default (): void => CommandRegistry.register(new CommandDefinition("pos", true, args, posCommand, "Gets a players position in the world"));

function posCommand(args: any[], player: Player, game: Game){
    const username = args[1];
    const p = game.playerManager.getPlayerByUsername(username);

    if(p !== undefined){
        game.chatManager.sendMessageTo(player, `${p.getUsername()} is at ${Math.floor(p.x)}, ${Math.floor(p.y)}`);
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
