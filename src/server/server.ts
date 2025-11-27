import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import bodyParser from "body-parser";
import { Server as SocketIo } from "socket.io";
import { Socket } from "socket.io-client";

import webpackConfig from "../../webpack.dev.js";

import ServerConfig from "configs/server.js";
import SharedConfig from "configs/shared.js";
import Game from "game/game.js";
import userController from "server/controllers/userController.js";
import FileManager from "server/fileManager.js";
import Logger from "server/logging/logger.js";
import LogManager from "server/logging/logManager.js";
import configRoutes from "server/routes/config.js";
import userRoutes from "server/routes/user.js";
import Constants from "shared/constants.js";
import { JoinGameContent } from "shared/messageContentTypes.js";

const { MSG_TYPES, LOG_CATEGORIES } = Constants;
const { FAKE_PING } = SharedConfig.UPDATES;
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
    if(compiler == null){
        logger.error("Failed to create webpack compiler");
    }else{
        app.use(webpackDevMiddleware(compiler));
    }
}else{
    app.use(express.static("dist/webpack"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Including routes
app.use("/", userRoutes);

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
