class OpManager {
    constructor(fm){
        this.fileManager = fm;
        this.oppedplayers = {};

        this.load();
    }
    
    // #region setters

    op(username){
        this.oppedplayers[username] = true;
        this.save();
    }

    deop(username){
        delete this.oppedplayers[username];
        this.save();
    }

    // #endregion
    
    // #region getters

    isOp(username){
        return this.oppedplayers.hasOwnProperty(username);
    }

    opCount(){
        return Object.keys(this.oppedplayers).length;
    }

    opList(){
        return Object.keys(this.oppedplayers);
    }

    // #endregion
    
    // #region saving

    load(){
        if(!this.fileManager.fileExists("oplist")){
            return;
        }

        const data = this.fileManager.readFile("oplist").split("|");

        for(const username of data){
            this.op(username);
        }
    }

    save(){
        let data = "";

        for (const key of Object.keys(this.oppedplayers)) {
            data += key + "|";
        }

        this.fileManager.writeFile("oplist", data);
    }

    // #endregion
}

module.exports = OpManager;