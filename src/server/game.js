const crypto = require('crypto');

const Constants = require('../shared/constants.js');
const PlayerManager = require('./playerManager.js');
const OpManager = require('./opManager.js');
const BanManager = require('./banManager.js');
const World = require('./world/world.js');
const { attackHitCheck } = require('./collisions.js');
const { filterText } = require('./filter.js');
const { ExcecuteCommand } = require('./commands/commands.js');

const Pig = require('./objects/pig.js');

class Game {
    constructor(fm, am){
        // managers
        this.fileManager = fm;
        this.accountManager = am;
        this.playerManager = new PlayerManager(fm, this);
        this.opManager = new OpManager(fm);
        this.banManager = new BanManager(fm);

        // entities
        this.players = {};
        this.entities = { "tempid": new Pig("tempid", 0, 0, 0) };

        // world
        this.world = new World(fm);

        // updates
        this.lastUpdateTime = Date.now();
        this.shouldSendUpdate = false;

        // intervals
        setInterval(this.tickChunkUnloader.bind(this), 1000 / Constants.CHUNK_UNLOAD_RATE);
        setInterval(this.update.bind(this), 1000 / Constants.SERVER_UPDATE_RATE);

        // op passcode (one time use to give owner op)
        if(Constants.OP_PASSCODE && (this.opManager.opCount() == 0 || Constants.OP_PASSCODE_WHEN_OPS)){
            this.oppasscode = crypto.randomUUID();
            this.oppasscodeused = false;
            console.log(`oppasscode: ${this.oppasscode}`);
        }
    }

    // #region players

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
        if(this.banManager.isBanned(username)){
            socket.emit(Constants.MSG_TYPES.CONNECTION_REFUSED, { reason: "Banned", extra: this.banManager.banReason(username) });
            return;
        }

        this.playerManager.createPlayer(socket, username);

        this.players[socket.id].socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(this.players[socket.id]));
        socket.emit(Constants.MSG_TYPES.PLAYER_INSTANTIATED, {
            x: this.players[socket.id].x,
            y: this.players[socket.id].y,
            color: this.players[socket.id].color,
        });

        this.sendMessage(`${username} has connected`);
    }

    removePlayer(socket){
        if(this.players[socket.id]){
            this.sendMessage(`${this.players[socket.id].username} has disconnected`);

            this.playerManager.unloadPlayer(this.players[socket.id]);
        }
    }

    killPlayer(socket, killedby){
        this.sendMessage(`${this.players[socket.id].username} was killed by ${killedby}`);
        
        socket.emit(Constants.MSG_TYPES.DEAD);

        this.playerManager.killPlayer(this.players[socket.id]);
    }

    // #endregion

    // #region entities

    getEntities(){
        return [...Object.values(this.players), ...Object.values(this.entities)];
    }

    getPlayerEntities(){
        return Object.values(this.players);
    }

    getNonplayerEntities(){
        return Object.values(this.entities);
    }

    // #endregion

    // #region inputs

    click(socket, info){
        if(this.players[socket.id] !== undefined){
            if(Date.now() - this.players[socket.id].lastattack > Constants.ATTACK_DELAY * 1000){
                const dir = Math.atan2(info.xoffset, info.yoffset);
                const cellpos = { x: Math.floor(info.mex + info.xoffset), y: Math.floor(info.mey + info.yoffset) };

                const hotbarItem = this.players[socket.id].inventory[this.players[socket.id].hotbarslot];

                if(!hotbarItem){
                    // fist attack
                    this.players[socket.id].attack(dir);
                    attackHitCheck(this.players[socket.id], this.getEntities(), dir, 1);
                }else if(hotbarItem.attack){
                    this.players[socket.id].attack(dir);
                    attackHitCheck(this.players[socket.id], this.getEntities(), dir, hotbarItem.attack);
                }else if(hotbarItem.break){
                    this.world.breakcell(cellpos.x, cellpos.y);
                }else if(hotbarItem.place){
                    if(this.world.cellEmpty(cellpos.x, cellpos.y, this.getEntities()))
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
                this.players[socket.id].update({
                    dir: dir,
                    x: x,
                    y: y,
                    t: t,
                });
                this.players[socket.id].hotbarslot = hotbarslot;
            }
        }
    }

    // #endregion

    // #region updates

    update(){
        const now = Date.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // check deaths
        Object.values(this.players).forEach(p => {
            if(p.dead){
                this.killPlayer(p.socket, p.killedby);
            }
        });

        Object.values(this.entities).forEach(e => {
            if(e.dead){
                delete this.entities[e.id];
            }
        });

        // tick entities
        Object.values(this.entities).forEach(e => {
            e.ontick.emit("tick", dt);
        });

        // check to send update
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
        // get players
        const nearbyPlayers = Object.values(this.players).filter(p => p.id != player.id
            && Math.abs(p.x - player.x) < Constants.CELLS_HORIZONTAL / 2
            && Math.abs(p.y - player.y) < Constants.CELLS_VERTICAL / 2
        );

        // get fixes
        const fixescopy = player.getFixes();
        player.resetFixes();

        // get world updates
        const worldLoad = this.world.loadPlayerChunks(player);
        player.chunk = worldLoad.chunk;
        
        // check for falling
        const tilesOn = player.tilesOn();
        let notair = 0;
        tilesOn.forEach(tile => {
            const cell = this.world.getCell(tile.x, tile.y, false);
            if(cell){
                if(cell.floor){
                    notair++;
                }
            }
        });
        if(notair == 0){
            player.falling = true;
        }

        // get entities
        const nearbyEntities = Object.values(this.entities).filter(e =>
            Math.abs(e.x - player.x) < Constants.CELLS_HORIZONTAL / 2
            && Math.abs(e.y - player.y) < Constants.CELLS_VERTICAL / 2
        );

        // return full update object
        return {
            t: Date.now(),
            me: player.serializeForUpdate(),
            fixes: fixescopy,
            others: nearbyPlayers.map(p => p.serializeForUpdate()),
            entities: nearbyEntities.map(e => e.serializeForUpdate()),
            worldLoad: worldLoad,
        };
    }

    // #endregion

    // #region chat

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
            id: crypto.randomUUID(),
        };

        Object.values(this.players).forEach(player => {
            player.socket.emit(Constants.MSG_TYPES.RECEIVE_MESSAGE, newMessage);
        });
    }

    // #endregion
}

module.exports = Game;