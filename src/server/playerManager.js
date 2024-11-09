const Constants = require('../shared/constants.js');
const Player = require('./objects/player.js');

class PlayerManager {
    constructor(fm, g){
        this.fileManager = fm;
        this.game = g;

        this.saveInterval = setInterval(this.savePlayers.bind(this), 1000 * Constants.AUTOSAVE_RATE);
    }

    createPlayer(socket, username){
        if(this.fileManager.fileExists(getPlayerFilePath(username))){
            // load existing player from data
            const data = this.fileManager.readFile(getPlayerFilePath(username));
            this.game.players[socket.id] = new Player(socket.id, socket, username, 0, 0, 0, data);
        }else{
            // create new player
            let spawn = this.game.world.getSpawn();
            this.game.players[socket.id] = new Player(socket.id, socket, username, spawn.pos.x, spawn.pos.y, 0);
        }
    }

    savePlayer(player){
        const data = player.serializeForWrite();

        this.fileManager.writeFile(getPlayerFilePath(player.username), data);
    }

    deletePlayer(player){
        if(this.fileManager.fileExists(getPlayerFilePath(player.username)))
            this.fileManager.deleteFile(getPlayerFilePath(player.username));

        delete this.game.players[player.id];
    }

    unloadPlayer(player){
        this.savePlayer(player)

        delete this.game.players[player.id];
    }

    savePlayers(){
        Object.values(this.game.players).forEach(p => {
            this.savePlayer(p);
        })
    }
}

// #region helpers

// Get player file path
const getPlayerFilePath = (username) => ("players/" + username);

// #endregion

module.exports = PlayerManager;