const Constants = require('../shared/constants.js');
const Player = require('./player.js');
const Map = require('./map.js');
const {moveTouchingPlayers} = require('./collisions.js');
const {filterText} = require('./filter.js');

class Game {
    constructor() {
        this.players = {};
        this.leaves = [];
        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;
        this.map = new Map();
        this.leaderboard = [];
        setInterval(this.update.bind(this), 1000 / Constants.UPDATE_RATE);
    }

    getUsername(username){
        let newUsername = filterText(username.replace(/\s+/g, ''));
        if(newUsername.trim().length === 0){
            newUsername = "Silly Goose";
        }
        if(Object.values(this.players).some(e => e.username === newUsername)){
            let done = false;
            for(let i = 2; !done; i++){
                if(Object.values(this.players).some(e => e.username === newUsername + `${i}`)){
                    // this gonna take a bit
                }else{
                    newUsername += `${i}`;
                    done = true;
                }
            }
        }
        return newUsername;
    }

    addPlayer(socket, username) {
        let spawn = this.map.getSpawn();
        this.players[socket.id] = new Player(socket.id, socket, username, spawn[0], spawn[1], 0);
        this.players[socket.id].socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(this.players[socket.id]));
        socket.emit(Constants.MSG_TYPES.PLAYER_INSTANTIATED, {
            x: spawn[0],
            y: spawn[1]
        });
    }

    removePlayer(socket) {
        this.leaves.push(socket.id);
        delete this.players[socket.id];
    }

    shoot(socket){
        if(this.players[socket.id] !== undefined){
            if(Date.now() - this.players[socket.id].lastshot > Constants.PLAYER_FIRE_COOLDOWN * 1000){
                
                this.players[socket.id].lastshot = Date.now();
            }
        }
    }

    handleInput(socket, inputs) {
        if(this.players[socket.id] !== undefined){
            const { t, dir, x, y } = inputs;
            if (this.players[socket.id]) {
                this.players[socket.id].setDirection(dir);
                this.players[socket.id].move(t, x, y);
                moveTouchingPlayers(this.players[socket.id], Object.values(this.players), this.map);
            }
        }
    }

    update() {
        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        Object.values(this.players).forEach(p => {
            if(p.dead){
                p.socket.emit(Constants.MSG_TYPES.DEAD);
                this.removePlayer(p.socket);
            }
        })

        if (this.shouldSendUpdate) {
            Object.values(this.players).forEach(player => {
                player.socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player));
            });
            this.shouldSendUpdate = false;
        } else {
            this.shouldSendUpdate = true;
        }
    }

    createUpdate(player) {
        const nearbyPlayers = Object.values(this.players).filter(p => p.id != player.id);
        const leavscopy = [...this.leaves];
        this.leaves = [];

        return {
            t: Date.now(),
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            leaves: leavscopy,
        };
    }
}

module.exports = Game;