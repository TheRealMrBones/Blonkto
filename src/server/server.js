const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants.js');
const Game = require('./game.js');
const FileManager = require('./fileManager.js');
const AccountManager = require('./accountManager.js');
const webpackConfig = require('../../webpack.dev.js');

// #region init

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
console.log(`Server listening on port: ${port}`);

const io = socketio(server);

io.on('connection', socket => {
	console.log(`[${socket.id}] Connected`);

	socket.on(Constants.MSG_TYPES.CREATE_ACCOUNT, createAccount);
	socket.on(Constants.MSG_TYPES.LOGIN, login);
	socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	socket.on(Constants.MSG_TYPES.INPUT, handleInput);
	socket.on(Constants.MSG_TYPES.CLICK, click);
	socket.on(Constants.MSG_TYPES.INTERACT, interact);
	socket.on(Constants.MSG_TYPES.DISCONNECT, onDisconnect);
	socket.on(Constants.MSG_TYPES.SEND_MESSAGE, chat);
});

const fileManager = new FileManager();
const accountManager = new AccountManager(fileManager);
const game = new Game(fileManager, accountManager);

// #endregion

// #region socket functions

async function createAccount(credentials){
	const response = await accountManager.createAccount(this.id, credentials.username, credentials.password)
	this.emit(Constants.MSG_TYPES.LOGIN, response);

	if(response.account){
		console.log(`[${this.id}] Create account: ${response.account.username}`);
	}
}

async function login(credentials){
	const response = await accountManager.login(this.id, credentials.username, credentials.password)
	this.emit(Constants.MSG_TYPES.LOGIN, response);

	if(response.account){
		console.log(`[${this.id}] Logged in as: ${response.account.username}`);
	}
}

function joinGame(username){
	const newUsername = game.getUsername(username);
	console.log(`[${this.id}] [${accountManager.getAccount(this.id).username}] Joined the game`);
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
	const acc = accountManager.getAccount(this.id);

	if(acc){
		console.log(`[${this.id}] [${acc.username}] Disconnected`);
		accountManager.logout(this.id);
	}else{
		console.log(`[${this.id}] Disconnected`);
	}

  	game.removePlayer(this);
}

function chat(message){
  	game.chat(this, message);
}

// #endregion