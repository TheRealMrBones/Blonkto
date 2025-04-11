import EventEmitter from "events";

import NetworkingManager from "./managers/networkingManager.js";
import StateManager from "./managers/stateManager.js";
import { onGameOver } from "./index.js";
import World from "./world/world.js";
import CollisionManager from "./managers/collisionManager.js";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    readonly networkingManager: NetworkingManager;
    readonly stateManager: StateManager;
    readonly collisionManager: CollisionManager;
    readonly world: World;

    readonly eventEmitter: EventEmitter = new EventEmitter();

    constructor(){
        this.networkingManager = new NetworkingManager(this);
        this.stateManager = new StateManager(this);
        this.collisionManager = new CollisionManager(this);

        this.world = new World(this);

        this.eventEmitter.on("gameover", onGameOver);
    }
}

export default PlayerClient;