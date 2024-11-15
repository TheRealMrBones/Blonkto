class BanManager {
    constructor(fm){
        this.fileManager = fm;
        this.bannedplayers = {};

        this.load();
    }
    
    // #region setters

    ban(username){
        username = username.toLowerCase();
        this.bannedplayers[username] = true;
        this.save();
    }

    pardon(username){
        username = username.toLowerCase();
        delete this.bannedplayers[username];
        this.save();
    }

    // #endregion
    
    // #region getters

    isBanned(username){
        username = username.toLowerCase();
        return this.bannedplayers.hasOwnProperty(username);
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

        const data = this.fileManager.readFile("banlist").split("|");

        for(const username of data){
            this.ban(username);
        }
    }

    save(){
        let data = "";

        for (const key of Object.keys(this.bannedplayers)) {
            data += key + "|";
        }

        if(data.length > 0)
            data = data.substring(0, data.length - 1); // remove last |

        this.fileManager.writeFile("banlist", data);
    }

    // #endregion
}

module.exports = BanManager;