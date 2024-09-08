const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants.js');
const Game = require('./game.js');
const FileManager = require('./fileManager.js');
const webpackConfig = require('../../webpack.dev.js');

const app = express();

app.use(express.static('public'));

if(process.env.NODE_ENV === 'development'){
  	const compiler = webpack(webpackConfig);
  	app.use(webpackDevMiddleware(compiler));
}else{
  	app.use(express.static('dist'));
}

const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

const io = socketio(server);

io.on('connection', socket => {
	console.log('Player connected!', socket.id);

	socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	socket.on(Constants.MSG_TYPES.INPUT, handleInput);
	socket.on(Constants.MSG_TYPES.CLICK, click);
	socket.on(Constants.MSG_TYPES.INTERACT, interact);
	socket.on(Constants.MSG_TYPES.LEAVE_GAME, onDisconnect);
	socket.on(Constants.MSG_TYPES.SEND_MESSAGE, chat);
});

const fileManager = new FileManager();
const game = new Game(fileManager);

function joinGame(username){
	if(username.trim().length === 0){
		username = "Silly Goose";
	}
	const newUsername = game.getUsername(username);
	console.log('Player joined game!', newUsername, this.id);
	game.addPlayer(this, newUsername);
}

function handleInput(inputs){
  	game.handleInput(this, inputs);
}

function click(info){
	game.click(this, info);
}

function interact(info){
	game.interact(this, info);
}

function onDisconnect(){
	console.log('Player left game!', this.id);
  	game.removePlayer(this);
}

function chat(message){
  	game.chat(this, message);
}