import Game from '../game';

class BanManager {
    game: Game;
    bannedplayers: {[key: string]: string};

    constructor(game: Game){
        this.game = game;
        this.bannedplayers = {};

        this.load();
    }
    
    // #region setters

    ban(username: string, reason: string){
        username = username.toLowerCase();
        this.bannedplayers[username] = reason;
        this.save();
    }

    pardon(username: string){
        username = username.toLowerCase();
        delete this.bannedplayers[username];
        this.save();
    }

    clearBanList(){
        this.bannedplayers = {};
        this.save();
    }

    // #endregion
    
    // #region getters

    isBanned(username: string){
        username = username.toLowerCase();
        return this.bannedplayers.hasOwnProperty(username);
    }

    banReason(username: string){
        username = username.toLowerCase();
        return this.bannedplayers[username];
    }

    banList(){
        return Object.keys(this.bannedplayers);
    }

    // #endregion
    
    // #region saving

    load(){
        if(!this.game.fileManager.fileExists("banlist")){
            return;
        }

        const rawdata = this.game.fileManager.readFile("banlist");
        if(!rawdata){
            return;
        }
        if(rawdata.length == 0 || rawdata.trim() === ""){
            return;
        }

        const data = rawdata.split("|");

        for(let rawbandata of data){
            const bandata = rawbandata.split(",");
            this.ban(bandata[0], bandata[1]);
        }
    }

    save(){
        let data = "";

        for (const key of Object.keys(this.bannedplayers)) {
            data += key + "," + this.bannedplayers[key] + "|";
        }

        if(data.length > 0)
            data = data.substring(0, data.length - 1); // remove last |

        this.game.fileManager.writeFile("banlist", data);
    }

    // #endregion
}

export default BanManager;