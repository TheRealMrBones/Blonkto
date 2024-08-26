const Constants = require('../../shared/constants.js');

class Item {
    constructor(id){
        this.id = id;
        this.name = "placeholder";
        this.break = false; // set to breaking info
        this.place = false; // set to type of object to place
        this.attack = false; // set to attack info
        this.asset = Constants.ASSETS.MISSING_TEXTURE; // default incase its never set
    }
}

module.exports = Item;