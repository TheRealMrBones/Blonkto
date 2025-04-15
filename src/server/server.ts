import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import Game from "../game/game.js";
import userController from "./controllers/userController.js";
import FileManager from "./fileManager.js";
import LogManager from "./logging/logManager.js";
import Logger from "./logging/logger.js";
import webpackConfig from "../../webpack.dev.js";
import { ClickContent, CraftContent, DropContent, InputContent, JoinGameContent, SendMessageContent, SwapContent } from "../shared/messageContentTypes.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES, LOG_CATEGORIES } = Constants;

import SharedConfig from "../configs/shared.js";
const { FAKE_PING } = SharedConfig.UPDATES;

import ServerConfig from "../configs/server.js";
const { LOG_CONNECTIONS } = ServerConfig.LOG;

// #region init

const app = express();

const fileManager = new FileManager();
LogManager.getLogManager().setFileManager(fileManager);
const logger = Logger.getLogger(LOG_CATEGORIES.SERVER);
logger.info("Initializing server");
const game = new Game(fileManager);

// Middleware
app.use(express.static("public"));

if(process.env.NODE_ENV === "development"){
  	const compiler = webpack(webpackConfig);
  	app.use(webpackDevMiddleware(compiler));
}else{
  	app.use(express.static("dist/webpack"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Including routes
import userRoutes from "./routes/user.js";
app.use("/", userRoutes);

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

/** Response to the join game message from a client */
async function joinGame(this: Socket, content: JoinGameContent): Promise<void> {
    const account = await userController.verifyToken(content.token);
    if(!account.valid) return;

    const username = account.username;
    game.playerManager.addPlayer(this, username);
}

/** Response to the ping message from a client */
function ping(this: Socket): void {
    if(FAKE_PING == 0) this.emit(MSG_TYPES.PING);
    else setTimeout(() =>
        this.emit(MSG_TYPES.PING)
    , FAKE_PING / 2);
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
  	game.playerManager.removePlayer(this);
}

/** Response to the chat message from a client */
function chat(this: Socket, content: SendMessageContent): void {
  	game.chatManager.chat(this, content);
}

// #endregion