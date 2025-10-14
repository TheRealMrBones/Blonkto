import io from "socket.io-client";
import { throttle } from "throttle-debounce";
import { Socket } from "socket.io";

import PlayerClient from "../playerClient.js";
import { connectionRefused, connectionAccepted } from "../index.js";
import { ClickContent, CraftContent, DropContent, InputContent, JoinGameContent, PlayerInstantiatedContent, SendMessageContent, SwapContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { FAKE_PING } = SharedConfig.UPDATES;

/** Manages sending and receiving messages between the client and the server */
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
                this.startPinging();
                console.log("Connected to server!");
                resolve();
            });
        });

        connectedPromise.then(() => {
            this.addListener(MSG_TYPES.CONNECTION_REFUSED, connectionRefused);
            this.addListener(MSG_TYPES.PING, this.onPing.bind(this));
            this.addListener(MSG_TYPES.PLAYER_INSTANTIATED, this.onInstantiated.bind(this));
            this.addListener(MSG_TYPES.GAME_UPDATE, playerclient.stateManager.processGameUpdate.bind(playerclient.stateManager));
            this.addListener(MSG_TYPES.DEAD, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.KICK, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.BAN, (temp: any) => this.playerclient.eventEmitter.emit("gameover", temp));
            this.addListener(MSG_TYPES.RECEIVE_MESSAGE, this.playerclient.renderer.chatManager.receiveChatMessage.bind(this.playerclient.renderer.chatManager));
        });
    }

    // #region socket messages

    /** Adds a new listener to the clients socket */
    addListener(event: string, listener: (...args: any[]) => void): void {
        this.socket.on(event, listener);
    }

    /** Sends the given message (and content) to the server */
    emit(event: string, content?: any): void {
        if(FAKE_PING == 0) this.socket.emit(event, content);
        else setTimeout(() =>
            this.socket.emit(event, content)
        , FAKE_PING / 2);
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

    // #endregion

    // #region default listeners

    /** Response to the player instantiated message from the server */
    onInstantiated(content: PlayerInstantiatedContent): void {
        connectionAccepted();
        this.playerclient.inputManager.startCapturingInput(content.x, content.y);
        this.playerclient.renderer.setColor(content.color);
        this.playerclient.renderer.startRendering();
        this.playerclient.renderer.uiManager.setupUi();
    }

    // #endregion

    // #region ping

    /** Sets the pinging interval to retreive new ping values */
    startPinging(): void {
        this.pinginterval = setTimeout(this.ping.bind(this), 1000);
    }

    /** Stops the pinging interval to stop retreiving new ping values */
    stopPinging(): void {
        clearTimeout(this.pinginterval);
    }

    /** Method to send the ping message to the server */
    ping(): void {
        this.emit(MSG_TYPES.PING);
        this.pingsent = Date.now();
    }

    /** Response to the ping message from the server */
    onPing(): void {
        const ping = Date.now() - this.pingsent;
        this.playerclient.renderer.uiManager.updatePing(ping);
        this.pinginterval = setTimeout(this.ping.bind(this), 1000);
    }

    // #endregion
}

export default NetworkingManager;
