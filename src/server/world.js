const Constants = require('../shared/constants.js');

class World {
    constructor(){
        // defaults
        this.spawnpoints = [[0, 0]];
        this.loadWorld();
    }

    loadWorld(){
        
    }

    getSpawn(){
        return this.spawnpoints[0];
    }
}

module.exports = World;