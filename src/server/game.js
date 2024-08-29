const Constants = require('../shared/constants.js');
const Player = require('./objects/player.js');
const World = require('./world/world.js');
const shortid = require('shortid');
const { attackHitCheck } = require('./collisions.js');
const { filterText } = require('./filter.js');
const { ExcecuteCommand } = require('./commands/commands.js');

class Game {
    constructor(){
        this.players = {};
        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;
        this.world = new World();

        setInterval(this.tickChunkUnloader.bind(this), 1000 / Constants.CHUNK_UNLOAD_RATE);
        setInterval(this.update.bind(this), 1000 / Constants.SERVER_UPDATE_RATE);

        this.oppasscode = shortid().toString();
        this.oppasscodeused = false;
        console.log(`oppasscode: ${this.oppasscode}`);
    }

    getUsername(username){
        let newUsername = Constants.FILTER_USERNAME ? filterText(username.replace(/\s+/g, '')) : username.replace(/\s+/g, '');
        if(newUsername.trim().length === 0){
            newUsername = "Silly Goose";
        }

        if(Object.values(this.players).some(e => e.username === newUsername)){
            let done = false;
            for(let i = 2; !done; i++){
                if(!Object.values(this.players).some(e => e.username === newUsername + `${i}`)){
                    done = true;
                    newUsername += `${i}`;
                }
            }
        }
        return newUsername;
    }

    addPlayer(socket, username){
        let spawn = this.world.getSpawn();
        this.players[socket.id] = new Player(socket.id, socket, username, spawn.pos.x, spawn.pos.y, 0);
        this.players[socket.id].chunk = { x: spawn.chunk.x + 10, y: spawn.chunk.y + 10}; // purposefully make chunk off so that new update has load data
        this.players[socket.id].socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(this.players[socket.id]));
        socket.emit(Constants.MSG_TYPES.PLAYER_INSTANTIATED, {
            x: spawn.pos.x,
            y: spawn.pos.y,
            color: this.players[socket.id].color,
        });

        this.sendMessage(`${username} has connected`);
    }

    removePlayer(socket){
        if(!this.players[socket.id]){
            return; // temp fix until i redo player saving / death mechanic
        }
        this.sendMessage(`${this.players[socket.id].username} has disconnected`);
        delete this.players[socket.id];
    }

    killPlayer(socket, killedby){
        this.sendMessage(`${this.players[socket.id].username} was killed by ${killedby}`);
        delete this.players[socket.id];
    }

    click(socket, info){
        if(this.players[socket.id] !== undefined){
            if(Date.now() - this.players[socket.id].lastattack > Constants.ATTACK_DELAY * 1000){
                const dir = Math.atan2(info.xoffset, info.yoffset);
                const cellpos = { x: Math.floor(info.mex + info.xoffset), y: Math.floor(info.mey + info.yoffset) };

                const hotbarItem = this.players[socket.id].inventory[this.players[socket.id].hotbarslot];

                if(!hotbarItem){
                    // fist attack
                    attackHitCheck(this.players[socket.id], Object.values(this.players), dir, 1);
                    this.players[socket.id].lastattack = Date.now();
                    this.players[socket.id].lastattackdir = dir;
                }else if(hotbarItem.attack){
                    attackHitCheck(this.players[socket.id], Object.values(this.players), dir, hotbarItem.attack);
                    this.players[socket.id].lastattack = Date.now();
                    this.players[socket.id].lastattackdir = dir;
                }else if(hotbarItem.break){
                    this.world.breakcell(cellpos.x, cellpos.y);
                }else if(hotbarItem.place){
                    this.world.placecell(cellpos.x, cellpos.y, hotbarItem.getPlaced());
                }else{
                    // not usable i guess idk
                }
            }
        }
    }

    interact(socket, info){
        if(this.players[socket.id] !== undefined){
            
        }
    }

    handleInput(socket, inputs){
        if(this.players[socket.id] !== undefined){
            const { t, dir, x, y, hotbarslot } = inputs;
            if(this.players[socket.id]){
                this.players[socket.id].setDirection(dir);
                this.players[socket.id].move(t, x, y);
                this.players[socket.id].hotbarslot = hotbarslot;
            }
        }
    }

    update(){
        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        Object.values(this.players).forEach(p => {
            if(p.dead){
                p.socket.emit(Constants.MSG_TYPES.DEAD);
                this.killPlayer(p.socket, p.killedby);
            }
        })

        if(this.shouldSendUpdate){
            // send fat update packets
            Object.values(this.players).forEach(player => {
                player.socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player));
            });
            this.shouldSendUpdate = false;

            // reset cell updates in loaded chunks
            this.world.resetCellUpdates();
        }else{
            this.shouldSendUpdate = true;
        }
    }

    tickChunkUnloader(){
        this.world.tickChunkUnloader(Object.values(this.players));
    }

    createUpdate(player){
        const nearbyPlayers = Object.values(this.players).filter(p => p.id != player.id
            && Math.abs(p.x - player.x) < Constants.CELLS_HORIZONTAL / 2
            && Math.abs(p.y - player.y) < Constants.CELLS_VERTICAL / 2
        );
        const fixescopy = player.getFixes();
        player.resetFixes();

        const worldLoad = this.world.loadPlayerChunks(player);
        player.chunk = worldLoad.chunk;

        return {
            t: Date.now(),
            fixes: fixescopy,
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            worldLoad: worldLoad,
        };
    }

    chat(socket, message){
        const text = Constants.FILTER_CHAT ? filterText(message.text.trim()) : message.text.trim();
        if(text.length == 0){
            // empty message
        }else if(text[0] == '/'){
            // command
            ExcecuteCommand(this, this.players[socket.id], text.substring(1));
        }else{
            // normal message
            const newText = `<${this.players[socket.id].username}> ${text}`;
            this.sendMessage(newText);
        }
    }

    sendMessage(text){
        const newMessage = {
            text: text,
            id: shortid(),
        };

        Object.values(this.players).forEach(player => {
            player.socket.emit(Constants.MSG_TYPES.RECEIVE_MESSAGE, newMessage);
        });
    }
}

module.exports = Game;