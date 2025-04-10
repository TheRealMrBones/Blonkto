import io from "socket.io-client";
import { throttle } from "throttle-debounce";

import { processGameUpdate } from "./state.js";
import { startRendering, setColor } from "../render/render.js";
import { startCapturingInput } from "../input/input.js";
import { setupUi, updatePing } from "../render/ui.js";
import { receiveChatMessage } from "../render/chat.js";
import { connectionRefused, connectionAccepted } from "../index.js";
import { setInventory } from "../inventory/inventory.js";
import { ClickContent, CraftContent, DropContent, InputContent, JoinGameContent, PlayerInstantiatedContent, SendMessageContent, SwapContent } from "../../shared/messageContentTypes.js";

import Constants from "../../shared/constants.js";
const { MSG_TYPES } = Constants;

// #region init

const socketProtocol = (window.location.protocol.includes("https")) ? "wss" : "ws";
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise<void>(resolve => {
    socket.on("connect", () => {
        pinginterval = setInterval(ping, 1000);
        console.log("Connected to server!");
        resolve();
    });
});

/** Main method to connect and prepare the clients socket for interaction with the server */
export const connect = (onGameOver: any): Promise<void> => (
    connectedPromise.then(() => {
        socket.on(MSG_TYPES.CONNECTION_REFUSED, connectionRefused);
        socket.on(MSG_TYPES.PING, onPing);
        socket.on(MSG_TYPES.PLAYER_INSTANTIATED, onInstantiated);
        socket.on(MSG_TYPES.GAME_UPDATE, processGameUpdate);
        socket.on(MSG_TYPES.DEAD, onGameOver);
        socket.on(MSG_TYPES.KICK, onGameOver);
        socket.on(MSG_TYPES.BAN, onGameOver);
        socket.on(MSG_TYPES.RECEIVE_MESSAGE, receiveChatMessage);
    })
);

/** Response to the player instantiated message from the server */
function onInstantiated(content: PlayerInstantiatedContent): void {
    connectionAccepted();
    startCapturingInput(content.x, content.y);
    setColor(content.color);
    startRendering();
    setupUi();
    setInventory(content.inventory);
}

// #endregion

// #region send message functions

/** Method to send the play message to the server */
export const play = (content: JoinGameContent): void => {
    socket.emit(MSG_TYPES.JOIN_GAME, content);
};

/** Method to send the update inputs message to the server */
export const updateInputs = throttle(10, (content: InputContent) => {
    socket.emit(MSG_TYPES.INPUT, content);
});

/** Method to send the click message to the server */
export const click = throttle(20, (content: ClickContent) => {
    socket.emit(MSG_TYPES.CLICK, content);
});

/** Method to send the interact message to the server */
export const interact = throttle(20, (content: ClickContent) => {
    socket.emit(MSG_TYPES.INTERACT, content);
});

/** Method to send the drop message to the server */
export const drop = throttle(20, (content: DropContent) => {
    socket.emit(MSG_TYPES.DROP, content);
});

/** Method to send the swap message to the server */
export const swap = throttle(20, (content: SwapContent) => {
    socket.emit(MSG_TYPES.SWAP, content);
});

/** Method to send the craft message to the server */
export const craft = throttle(20, (content: CraftContent) => {
    socket.emit(MSG_TYPES.CRAFT, content);
});

/** Method to send the chat message to the server */
export const chat = throttle(20, (content: SendMessageContent) => {
    socket.emit(MSG_TYPES.SEND_MESSAGE, content);
});

// #endregion

// #region ping

let pinginterval = null;
let pingsent = 0;

function ping(){
    socket.emit(MSG_TYPES.PING);
    pingsent = Date.now();
}

function onPing(){
    const ping = Date.now() - pingsent;
    updatePing(ping);
}

// #endregion