import EventEmitter from "events";

import NetworkingManager from "./managers/networkingManager.js";
import StateManager from "./managers/stateManager.js";
import { onGameOver } from "./index.js";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    networkingManager: NetworkingManager;
    stateManager: StateManager;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(){
        this.networkingManager = new NetworkingManager(this);
        this.stateManager = new StateManager(this);

        this.eventEmitter.on("gameover", onGameOver);
    }
}

export default PlayerClient;