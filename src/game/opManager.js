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

    clearOpList(username){
        this.oppedplayers = {};
        
        // if username given keep that user opped
        if(username){
            this.oppedplayers[username] = true;
        }
        
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

        let data = this.fileManager.readFile("oplist");

        if(data.length == 0 || data.trim() === ""){
            return;
        }

        data = data.split("|");

        for(const username of data){
            this.op(username);
        }
    }

    save(){
        let data = "";

        for (const key of Object.keys(this.oppedplayers)) {
            data += key + "|";
        }

        if(data.length > 0)
            data = data.substring(0, data.length - 1); // remove last |

        this.fileManager.writeFile("oplist", data);
    }

    // #endregion
}

export default OpManager;