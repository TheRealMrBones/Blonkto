const Constants = require('../shared/constants.js');

class Map{
    constructor(){
        // defaults
        this.spawnpoints = [[0, 0]];
        this.loadmap();
    }

    loadmap(){
        
    }

    getSpawn(){
        return this.spawnpoints[0];
    }
}

module.exports = Map;