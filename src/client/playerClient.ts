import EventEmitter from "events";

import NetworkingManager from "./managers/networkingManager.js";
import StateManager from "./managers/stateManager.js";
import InputManager from "./managers/inputManager.js";
import CollisionManager from "./managers/collisionManager.js";
import World from "./world/world.js";
import Inventory from "./inventory/inventory.js";
import { onGameOver } from "./index.js";
import Renderer from "./render/renderer.js";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    readonly networkingManager: NetworkingManager;
    readonly stateManager: StateManager;
    readonly inputManager: InputManager;
    readonly collisionManager: CollisionManager;
    readonly world: World;
    readonly inventory: Inventory;
    readonly renderer: Renderer;

    readonly eventEmitter: EventEmitter = new EventEmitter();

    constructor(){
        this.networkingManager = new NetworkingManager(this);
        this.stateManager = new StateManager(this);
        this.inputManager = new InputManager(this);
        this.collisionManager = new CollisionManager(this);

        this.world = new World(this);
        this.inventory = new Inventory(this);
        this.renderer = new Renderer(this);

        this.eventEmitter.on("gameover", onGameOver);
    }
}

export default PlayerClient;