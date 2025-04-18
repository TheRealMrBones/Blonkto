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
import { JoinGameContent } from "../shared/messageContentTypes.js";

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
});

logger.info("Server initialized");

// initialize game
const game = new Game(io, fileManager);

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

// #endregion