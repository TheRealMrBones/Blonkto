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
import { ClickContent, CraftContent, CreateAccountContent, DropContent, InputContent, isLoginResponseContent, LoginContent, LoginResponseContent, SendMessageContent, SwapContent } from "../shared/messagecontenttypes.js";

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
    socket.on(MSG_TYPES.CRAFT, craft);
    socket.on(MSG_TYPES.DISCONNECT, onDisconnect);
    socket.on(MSG_TYPES.SEND_MESSAGE, chat);
});

logger.info("Server initialized");

// #endregion

// #region socket functions

/** Response to the create account message from a client */
async function createAccount(this: Socket, content: CreateAccountContent): Promise<void> {
    if(this.id === undefined) return;
	
    const response = await accountManager.createAccount(this.id, content.username, content.password);
    this.emit(MSG_TYPES.LOGIN, response);

    if(isLoginResponseContent(response) && LOG_CONNECTIONS) logger.log(`[${this.id}] Create account: ${response.account.username}`);
}

/** Response to the login message from a client */
async function login(this: Socket, content: LoginContent): Promise<void> {
    if(this.id === undefined) return;
	
    const response = await accountManager.login(this.id, content.username, content.password);
    this.emit(MSG_TYPES.LOGIN, response);

    if(isLoginResponseContent(response) && LOG_CONNECTIONS) logger.log(`[${this.id}] Logged in as: ${response.account.username}`);
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
function handleInput(this: Socket, content: InputContent): void {
  	game.handlePlayerInput(this, content);
}

/** Response to the click message from a client */
function click(this: Socket, content: ClickContent): void {
    game.handlePlayerClick(this, content);
}

/** Response to the interact message from a client */
function interact(this: Socket, content: ClickContent): void {
    game.handlePlayerInteract(this, content);
}

/** Response to the drop message from a client */
function drop(this: Socket, content: DropContent): void {
    game.handlePlayerDrop(this, content);
}

/** Response to the swap message from a client */
function swap(this: Socket, content: SwapContent): void {
    game.handlePlayerSwap(this, content);
}

/** Response to the craft message from a client */
function craft(this: Socket, content: CraftContent): void {
    game.handlePlayerCraft(this, content);
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
function chat(this: Socket, content: SendMessageContent): void {
  	game.chatManager.chat(this, content);
}

// #endregion