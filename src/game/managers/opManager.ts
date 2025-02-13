import FileManager from "../../server/fileManager";

class OpManager {
    fileManager: FileManager;
    oppedplayers: {[key: string]: boolean};

    constructor(fileManager: FileManager){
        this.fileManager = fileManager;
        this.oppedplayers = {};

        this.load();
    }
    
    // #region setters

    op(username: string){
        this.oppedplayers[username] = true;
        this.save();
    }

    deop(username: string){
        delete this.oppedplayers[username];
        this.save();
    }

    clearOpList(username: string){
        this.oppedplayers = {};
        
        // if username given keep that user opped
        if(username){
            this.oppedplayers[username] = true;
        }
        
        this.save();
    }

    // #endregion
    
    // #region getters

    isOp(username: string){
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

        let rawdata = this.fileManager.readFile("oplist");
        if(!rawdata){
            return;
        }
        if(rawdata.length == 0 || rawdata.trim() === ""){
            return;
        }

        const data = rawdata.split("|");

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