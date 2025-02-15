import OpCommand from "./opCommand.js";
import DeopCommand from "./deopCommand.js";
import OppedCommand from "./oppedCommand.js";
import OpListCommand from "./opListCommand.js";
import TpCommand from "./tpCommand.js";
import PingCommand from "./pingCommand.js";
import NickCommand from "./nickCommand.js";
import HelpCommand from "./helpCommand.js";
import KillCommand from "./killCommand.js";
import SaveWorldCommand from "./saveWorldCommand.js";
import KickCommand from "./kickCommand.js";
import BanCommand from "./banCommand.js";
import PardonCommand from "./pardonCommand.js";
import BanListCommand from "./banListCommand.js";
import ClearBanListCommand from "./clearBanListCommand.js";
import ClearOpListCommand from "./clearOpListCommand.js";

const commands = [
    OpCommand,
    DeopCommand,
    OppedCommand,
    OpListCommand,
    TpCommand,
    PingCommand,
    NickCommand,
    HelpCommand,
    KillCommand,
    SaveWorldCommand,
    KickCommand,
    BanCommand,
    PardonCommand,
    BanListCommand,
    ClearBanListCommand,
    ClearOpListCommand
];

export const ExcecuteCommand = (game, player, command) => {
    if(command.length == 0){
        game.chatManager.sendMessageTo(player, "no command given");
        return;
    }

    const tokens = command.split(" ");
    const key = tokens[0];

    // Find command
    const c = commands.find(c => c.key == key);
    if(c){
        c.execute(game, player, tokens);
    }else{
        game.chatManager.sendMessageTo(player, `command "${key}" not found`);
    }
};