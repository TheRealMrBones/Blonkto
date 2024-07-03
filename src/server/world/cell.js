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
}

module.exports = Cell;