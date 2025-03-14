import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import Game from "../game/game.js";
import FileManager from "./fileManager.js";
import LogManager from "./logging/logManager.js";
import Logger from "./logging/logger.js";
import AccountManager from "./accountManager.js";
import webpackConfig from "../../webpack.dev.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import ServerConfig from "../configs/server.js";
const { LOG_CONNECTIONS } = ServerConfig.LOG;

// #region init

const app = express();

const fileManager = new FileManager();
LogManager.getLogManager().setFileManager(fileManager);
const logger = Logger.getLogger(LOG_CATEGORIES.SERVER);
logger.info("Initializing server");
const accountManager = new AccountManager(fileManager);
const game = new Game(fileManager, accountManager);

// Sending resources
app.use(express.static("public"));

if(process.env.NODE_ENV === "development"){
  	const compiler = webpack(webpackConfig);
  	app.use(webpackDevMiddleware(compiler));
}else{
  	app.use(express.static("dist/webpack"));
}

// Including routes
import configRoutes from "./routes/config.js";
app.use("/", configRoutes);

// Opening server
const port = process.env.PORT || 3000;
const server = app.listen(port);
logger.log(`Server listening on port: ${port}`);

// Opening socketio
const io = new SocketIo(server);

io.on("connection", socket => {
    if(LOG_CONNECTIONS) logger.log(`[${socket.id}] Connected`);

    socket.on(MSG_TYPES.CREATE_ACCOUNT, createAccount);
    socket.on(MSG_TYPES.LOGIN, login);
    socket.on(MSG_TYPES.JOIN_GAME, joinGame);
    socket.on(MSG_TYPES.PING, ping);
    socket.on(MSG_TYPES.INPUT, handleInput);
    socket.on(MSG_TYPES.CLICK, click);
    socket.on(MSG_TYPES.INTERACT, interact);
    socket.on(MSG_TYPES.DROP, drop);
    socket.on(MSG_TYPES.SWAP, swap);
    socket.on(MSG_TYPES.DISCONNECT, onDisconnect);
    socket.on(MSG_TYPES.SEND_MESSAGE, chat);
});

logger.info("Server initialized");

// #endregion

// #region socket functions

/** Response to the create account message from a client */
async function createAccount(this: Socket, credentials: { username: string; password: string; }): Promise<void> {
    if(this.id === undefined) return;
	
    const response = await accountManager.createAccount(this.id, credentials.username, credentials.password);
    this.emit(MSG_TYPES.LOGIN, response);

    if(response.account && LOG_CONNECTIONS) logger.log(`[${this.id}] Create account: ${response.account.username}`);
}

/** Response to the login message from a client */
async function login(this: Socket, credentials: { username: string; password: string; }): Promise<void> {
    if(this.id === undefined) return;
	
    const response = await accountManager.login(this.id, credentials.username, credentials.password);
    this.emit(MSG_TYPES.LOGIN, response);

    if(response.account && LOG_CONNECTIONS) logger.log(`[${this.id}] Logged in as: ${response.account.username}`);
}

/** Response to the join game message from a client */
function joinGame(this: Socket): void {
    if(this.id === undefined) return;
	
    const username = accountManager.getAccount(this.id).username;
    if(LOG_CONNECTIONS) logger.log(`[${this.id}] [${username}] Joined the game`);
    game.playerManager.addPlayer(this, username);
}

/** Response to the ping message from a client */
function ping(this: Socket): void {
  	this.emit(MSG_TYPES.PING);
}

/** Response to the create account message from a client */
function handleInput(this: Socket, inputs: any): void {
  	game.handlePlayerInput(this, inputs);
}

/** Response to the click message from a client */
function click(this: Socket, info: any): void {
    game.handlePlayerClick(this, info);
}

/** Response to the interact message from a client */
function interact(this: Socket, info: any): void {
    game.handlePlayerInteract(this, info);
}

/** Response to the drop message from a client */
function drop(this: Socket, info: any): void {
    game.handlePlayerDrop(this, info);
}

/** Response to the swap message from a client */
function swap(this: Socket, info: any): void {
    game.handlePlayerSwap(this, info);
}

/** Response to the disconnect message from a client */
function onDisconnect(this: Socket): void {
    if(this.id === undefined) return;
	
    const acc = accountManager.getAccount(this.id);

    if(acc){
        if(LOG_CONNECTIONS) logger.log(`[${this.id}] [${acc.username}] Disconnected`);
        accountManager.logout(this.id);
    }else{
        if(LOG_CONNECTIONS) logger.log(`[${this.id}] Disconnected`);
    }

  	game.playerManager.removePlayer(this);
}

/** Response to the chat message from a client */
function chat(this: Socket, message: any): void {
  	game.chatManager.chat(this, message);
}

// #endregion