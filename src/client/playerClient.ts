import EventEmitter from "events";

import { onGameOver } from "client/index.js";
import Inventory from "client/inventory/inventory.js";
import CollisionManager from "client/managers/collisionManager.js";
import InputManager from "client/managers/inputManager.js";
import NetworkingManager from "client/managers/networkingManager.js";
import StateManager from "client/managers/stateManager.js";
import Renderer from "client/render/renderer.js";
import World from "client/world/world.js";
import Constants from "shared/constants.js";

const { GAME_MODES } = Constants;

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

    private gamemode: string = GAME_MODES.SURVIVAL;

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

    /** Sets the gamemode of this client */
    setGamemode(gamemode: string): void {
        this.gamemode = gamemode;
    }

    /** Returns the gamemode of this client */
    getGamemode(): string {
        return this.gamemode;
    }
}

export default PlayerClient;
