import ServerConfig from "configs/server.js";
import CommandDefinition from "game/definitions/commandDefinition.js";
import Game from "game/game.js";
import Player from "game/objects/player.js";
import CommandRegistry from "game/registries/commandRegistry.js";
import Constants from "shared/constants.js";

const { COMMAND_ARGUMENTS } = Constants;
const { DAY_LENGTH, NIGHT_LENGTH, DAY_TRANSITION_LENGTH } = ServerConfig.WORLD;

const args = [
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.INT],
    [COMMAND_ARGUMENTS.KEY, COMMAND_ARGUMENTS.STRING],
];

export default (): void => CommandRegistry.register(new CommandDefinition("settime", true, args, setTimeCommand, "Sets the time of the world"));

function setTimeCommand(args: any[], player: Player, game: Game){
    const argIndex = args[0];

    let newtime = 0;
    if(argIndex === 0){
        newtime = args[1] as number;
    }else{
        switch(args[1] as string){
            case "day": {
                newtime = DAY_TRANSITION_LENGTH;
                break;
            }
            case "night": {
                newtime = DAY_LENGTH + DAY_TRANSITION_LENGTH;
                break;
            }
            default: {
                newtime = -1;
                break;
            }
        }
    }

    if(newtime < 0){
        game.chatManager.sendMessageTo(player, "New time must either be \"day\", \"night\", or a positive number");
        return;
    }

    const daycycletick = newtime % (DAY_LENGTH + NIGHT_LENGTH);
    game.world.setDayTick(daycycletick);
    game.chatManager.sendMessageTo(player, `New time set to: ${daycycletick}`);
}
