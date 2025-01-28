class Cell {
    constructor(block, floor, ceiling){
        this.block = block;
        this.floor = floor;
        this.ceiling = ceiling;
    }

    // #region serialization

    serializeForLoad(){
        const data = {};
        if(this.block){
            data.block = this.block.serializeForLoad();
        }
        if(this.floor){
            data.floor = this.floor.serializeForLoad();
        }
        if(this.ceiling){
            data.ceiling = this.ceiling.serializeForLoad();
        }

        return data;
    }

    serializeForWrite(){
        let data = "";
        if(this.block){
            data += this.block.serializeForWrite();
        }else {
            data += "0";
        }
        data += ",";
        if(this.floor){
            data += this.floor.serializeForWrite();
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

    // #endregion
}

module.exports = Cell;