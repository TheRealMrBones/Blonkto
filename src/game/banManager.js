class BanManager {
    constructor(fm){
        this.fileManager = fm;
        this.bannedplayers = {};

        this.load();
    }
    
    // #region setters

    ban(username, reason){
        username = username.toLowerCase();
        this.bannedplayers[username] = reason;
        this.save();
    }

    pardon(username){
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

    isBanned(username){
        username = username.toLowerCase();
        return this.bannedplayers.hasOwnProperty(username);
    }

    banReason(username){
        username = username.toLowerCase();
        return this.bannedplayers[username];
    }

    banList(){
        return Object.keys(this.bannedplayers);
    }

    // #endregion
    
    // #region saving

    load(){
        if(!this.fileManager.fileExists("banlist")){
            return;
        }

        let data = this.fileManager.readFile("banlist");

        if(data.length == 0 || data.trim() === ""){
            return;
        }

        data = data.split("|");

        for(let bandata of data){
            bandata = bandata.split(",");
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

        this.fileManager.writeFile("banlist", data);
    }

    // #endregion
}

export default BanManager;