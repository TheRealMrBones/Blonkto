class Cell {
    constructor(){
        // default cell (empty)
        this.floor = null;
        this.block = null;
        this.ceiling = null;
    }

    serializeForLoad(){
        const data = {};
        if(this.floor){
            data.floor = this.floor.serializeForLoad();
        }
        if(this.block){
            data.block = this.block.serializeForLoad();
        }
        if(this.ceiling){
            data.ceiling = this.ceiling.serializeForLoad();
        }

        return data;
    }

    serializeForWrite(){
        let data = "";
        if(this.floor){
            data += this.floor.serializeForWrite();
        }else {
            data += "0";
        }
        data += ",";
        if(this.block){
            data += this.block.serializeForWrite();
        }else {
            data += "0";
        }
        data += ",";
        if(this.ceiling){
            data += this.ceiling.serializeForWrite();
        }else {
            data += "0";
        }

        return data;
    }
}

module.exports = Cell;