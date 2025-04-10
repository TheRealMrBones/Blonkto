import EventEmitter from "events";

import NetworkingManager from "./managers/networkingManager.js";
import { onGameOver } from "./index.js";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    networkingManager: NetworkingManager;
    eventEmitter: EventEmitter = new EventEmitter();

    constructor(){
        this.networkingManager = new NetworkingManager(this);

        this.eventEmitter.on("gameover", onGameOver);
    }
}

export default PlayerClient;