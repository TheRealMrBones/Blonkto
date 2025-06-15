import Game from "../game.js";
import Player from "../objects/player.js";
import RegistryValue from "../registries/registryValue.js";

import Constants from "../../shared/constants.js";
const { COMMAND_ARGUMENTS } = Constants;

/** Base class for a command that can be run through chat by players in the game */
class Command implements RegistryValue {
    private key: string = "unregistered";
    private op: boolean;
    private possibleargs: any[][];
    private executeParsed: (args: any[], player: Player, game: Game) => void;
    private help: string;
    private customCanExecute: ((player: Player, game: Game) => boolean) | null = null;

    constructor(op: boolean, possibleargs: any[][], executeParsed: (args: any[], player: Player, game: Game) => void, help: string){
        this.op = op;
        this.possibleargs = possibleargs;
        this.executeParsed = executeParsed;
        this.help = help;
    }

    // #region registry helpers

    /** Sets this commands key in the ceiling registry */
    setRegistryKey(key: string): void {
        this.key = key;
    }

    /** Returns this commands registry key */
    getRegistryKey(): string {
        return this.key;
    }

    // #endregion

    // #region setters

    /** Sets the custom can execute to override the default one */
    overrideCanExecute(customCanExecute: (player: Player, game: Game) => boolean): void {
        this.customCanExecute = customCanExecute;
    }

    // #endregion

    // #region getters

    /** Returns if this command requires op */
    getOp(): boolean {
        return this.op;
    }

    /** Returns the help string of this command */
    getHelp(): string {
        return this.help;
    }

    // #endregion

    // #region command execution

    /** Tries to run this command with the given args */
    execute(rawargs: any[], player: Player, game: Game): void {
        if(!this.canExecute(player, game)){
            Command.sendNoPermission(player, game);
            return;
        }

        const args = this.parseArgs(rawargs, game);
        if(typeof args === "string") // string return is a parsing error
            game.chatManager.sendMessageTo(player, args);
        
        this.executeParsed(args as any[], player, game);
    }

    /** Sends a no permission response to the player running a command */
    static sendNoPermission(player: Player, game: Game): void {
        game.chatManager.sendMessageTo(player, "You do not have permission to use this command");
    }

    /** Returns if the requesting player has permission to execute this command */
    canExecute(player: Player, game: Game): boolean {
        if(this.customCanExecute !== null) return this.customCanExecute(player, game);
        return (!this.op || game.playerManager.opManager.isOp(player.username));
    }

    /** Returns the parsed args from the given raw args if they are compatable with this command and returns the error string otherwise */
    parseArgs(rawargs: any[], game: Game): any[] | string {
        // parsed args are the possible args but as they get checked the previous values change to the parsed rawargs
        const parsedargs = [];
        for(let i = 0; i < this.possibleargs.length; i++){
            parsedargs.push([...this.possibleargs[i]]);
        }
        let error = "Command Failed";

        // read inputed args to find correct args
        let backupsuccess = null;
        for(let i = 0; parsedargs.length > 0; i++){
            // end of inputed args
            if(rawargs.length == i){
                const correctrawargs = parsedargs.find(tkns => tkns.length == i);
                if(correctrawargs){
                    // correct args!
                    return correctrawargs;
                }else{
                    // too few args for available commands
                    error = `Incorrect arguments for command: ${this.key}`;
                    break;
                }
            }

            // check each possible arg if next raw arg is valid
            for(let j = 0; j < parsedargs.length; j++){
                if(parsedargs[j].length == i){
                    error = `Incorrect arguments for command: ${this.key}`;
                    parsedargs.splice(j, 1);
                    j--;
                    continue;
                }

                switch(parsedargs[j][i]){
                    case COMMAND_ARGUMENTS.KEY: {
                        // always set first arg (key) to the index of the original args (for use in actual command)
                        parsedargs[j][i] = j;
                        break;
                    }
                    case COMMAND_ARGUMENTS.PLAYER: {
                        const p = Object.values(game.players).find(p => (p as Player).username.toLowerCase() == rawargs[i].toLowerCase());
                        if(!p){
                            error = `Player "${rawargs[i]}" does not exist`;
                            parsedargs.splice(j, 1);
                            j--;
                        }else{
                            parsedargs[j][i] = p;
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.INT: {
                        if(isNaN(rawargs[i])){
                            error = `"${rawargs[i]}" is not an integer`;
                            parsedargs.splice(j, 1);
                            j--;
                        }else{
                            parsedargs[j][i] = parseInt(rawargs[i]);
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.FLOAT: {
                        if(isNaN(rawargs[i])){
                            error = `"${rawargs[i]}" is not a float`;
                            parsedargs.splice(j, 1);
                            j--;
                        }else{
                            parsedargs[j][i] = parseFloat(rawargs[i]);
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.BOOLEAN: {
                        switch(rawargs[i]){
                            case "true":
                            case "t":
                            case "1":
                                parsedargs[j][i] = true;
                                break;
                            case "false":
                            case "f":
                            case "0":
                                parsedargs[j][i] = false;
                                break;
                            default:
                                error = `"${rawargs[i]}" is not a boolean`;
                                parsedargs.splice(j, 1);
                                j--;
                                break;
                        }
                        break;
                    }
                    case COMMAND_ARGUMENTS.STRING: {
                        if((rawargs[i] as string).startsWith("\"")){
                            // try to read string that starts and end in quotes
                            let fullstring = (rawargs[i] as string).slice(1);
                            let endindex = fullstring.indexOf("\"");
                            if(endindex == fullstring.length - 1){
                                parsedargs[j][i] = fullstring.slice(0, -1);
                                break;
                            }else if(endindex != -1){
                                error = "string has bad end quote placement";
                                break;
                            }

                            let errored = false;
                            let hasend = false;
                            for(let k = i + 1; k < rawargs.length; rawargs.splice(k, 1)){
                                fullstring += " " + rawargs[k];
                                endindex = fullstring.indexOf("\"");
                                if(endindex == fullstring.length - 1){
                                    parsedargs[j][i] = fullstring.slice(0, -1);
                                    hasend = true;
                                    rawargs.splice(k, 1);
                                    break;
                                }else if(endindex != -1){
                                    error = "string has bad end quote placement";
                                    errored = true;
                                    break;
                                }
                            }

                            if(errored) break;
                            if(!hasend) error = "quoted string does not have end";
                        }else if((rawargs[i] as string).indexOf("\"") != -1){
                            // error because start quote must be at front
                            error = "string has bad start quote placement";
                        }else if(parsedargs[j].length == i + 1){
                            // just read entire rest of args if last argument needed
                            let fullstring = rawargs[i];
                            for(let k = i + 1; k < rawargs.length; k++){
                                fullstring += " " + rawargs[k];
                            }

                            parsedargs[j][i] = fullstring;
                            backupsuccess = [];
                            for(const val of parsedargs[j]){
                                backupsuccess.push(val);
                            }
                        }else{
                            parsedargs[j][i] = rawargs[i];
                        }
                        break;
                    }
                }
            }
        }

        // return backup success if exists
        if(backupsuccess !== null) return backupsuccess;

        // if no correct args found send most recent error
        return error;
    }

    // #endregion
}

export default Command;