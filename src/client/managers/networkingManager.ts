import io from "socket.io-client";
import { throttle } from "throttle-debounce";
import { Socket } from "socket.io";

import PlayerClient from "../playerClient.js";
import { startRendering, setColor } from "../render/render.js";
import { startCapturingInput } from "../input/input.js";
import { setupUi, updatePing } from "../render/ui.js";
import { receiveChatMessage } from "../render/chat.js";
import { connectionRefused, connectionAccepted } from "../index.js";
import { setInventory } from "../inventory/inventory.js";
import { ClickContent, CraftContent, DropContent, InputContent, JoinGameContent, PlayerInstantiatedContent, SendMessageContent, SwapContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES } = Constants;

class NetworkingManager {
    private readonly playerclient: PlayerClient;
    private readonly socket: Socket;

    private pinginterval: NodeJS.Timeout | undefined;
    private pingsent: number = 0;

    constructor(playerclient: PlayerClient){
        this.playerclient = playerclient;

        const socketProtocol = (window.location.protocol.includes("https")) ? "wss" : "ws";
        this.socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false }) as unknown as Socket;

        const connectedPromise = new Promise<void>(resolve => {
            this.socket.on("connect", () => {
                this.pinginterval = setInterval(this.ping.bind(this), 1000);
                console.log("Connected to server!");
                resolve();
            });
        });

        connectedPromise.then(() => {
            this.addListener(MSG_TYPES.CONNECTION_REFUSED, connectionRefused);
            this.addListener(MSG_TYPES.PING, this.onPing.bind(this));
            this.addListener(MSG_TYPES.PLAYER_INSTANTIATED, this.onInstantiated);
            this.addListener(MSG_TYPES.GAME_UPDATE, playerclient.stateManager.processGameUpdate.bind(playerclient.stateManager));
            this.addListener(MSG_TYPES.DEAD, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.KICK, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.BAN, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.RECEIVE_MESSAGE, receiveChatMessage);
        });
    }

    // #region socket messages

    /** Adds a new listener to the clients socket */
    addListener(event: string, listener: (...args: any[]) => void): void {
        this.socket.on(event, listener);
    }

    /** Sends the given message (and content) to the server */
    emit(event: string, content?: any): void {
        this.socket.emit(event, content);
    }

    // #endregion

    // #region default emitters

    /** Method to send the play message to the server */
    play(content: JoinGameContent): void {
        this.emit(MSG_TYPES.JOIN_GAME, content);
    };
    
    /** Method to send the update inputs message to the server */
    updateInputs = throttle(10, (content: InputContent) => {
        this.emit(MSG_TYPES.INPUT, content);
    });
    
    /** Method to send the click message to the server */
    click = throttle(20, (content: ClickContent) => {
        this.emit(MSG_TYPES.CLICK, content);
    });
    
    /** Method to send the interact message to the server */
    interact = throttle(20, (content: ClickContent) => {
        this.emit(MSG_TYPES.INTERACT, content);
    });
    
    /** Method to send the drop message to the server */
    drop = throttle(20, (content: DropContent) => {
        this.emit(MSG_TYPES.DROP, content);
    });
    
    /** Method to send the swap message to the server */
    swap = throttle(20, (content: SwapContent) => {
        this.emit(MSG_TYPES.SWAP, content);
    });
    
    /** Method to send the craft message to the server */
    craft = throttle(20, (content: CraftContent) => {
        this.emit(MSG_TYPES.CRAFT, content);
    });
    
    /** Method to send the chat message to the server */
    chat = throttle(20, (content: SendMessageContent) => {
        this.emit(MSG_TYPES.SEND_MESSAGE, content);
    });

    /** Method to send the ping message to the server */
    ping(): void {
        this.emit(MSG_TYPES.PING);
        this.pingsent = Date.now();
    }

    // #endregion

    // #region default listeners

    /** Response to the player instantiated message from the server */
    onInstantiated(content: PlayerInstantiatedContent): void {
        connectionAccepted();
        startCapturingInput(content.x, content.y);
        setColor(content.color);
        startRendering();
        setupUi();
        setInventory(content.inventory);
    }
    
    /** Response to the ping message from the server */
    onPing(): void {
        const ping = Date.now() - this.pingsent;
        updatePing(ping);
    }

    // #endregion
}

export default NetworkingManager;