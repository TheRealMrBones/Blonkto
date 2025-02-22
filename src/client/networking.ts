import io from "socket.io-client";
import { processGameUpdate } from "./state.js";
import { throttle } from "throttle-debounce";
import { startRendering, setColor } from "./render.js";
import { startCapturingInput } from "./input.js";
import { setupUi } from "./ui.js";
import { receiveChatMessage } from "./chat.js";
import { onlogin, connectionRefused, connectionAccepted } from "./index.js";
import { setInventory } from "./inventory.js";

import Constants from "../shared/constants.js";
const { MSG_TYPES } = Constants;

// #region init

const socketProtocol = (window.location.protocol.includes("https")) ? "wss" : "ws";
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise<void>(resolve => {
    socket.on("connect", () => {
        console.log("Connected to server!");
        resolve();
    });
});

/** Main method to connect and prepare the clients socket for interaction with the server */
export const connect = (onGameOver: any): Promise<void> => (
    connectedPromise.then(() => {
        socket.on(MSG_TYPES.LOGIN, onlogin);
        socket.on(MSG_TYPES.CONNECTION_REFUSED, connectionRefused);
        socket.on(MSG_TYPES.PLAYER_INSTANTIATED, onInstantiated);
        socket.on(MSG_TYPES.GAME_UPDATE, processGameUpdate);
        socket.on(MSG_TYPES.DEAD, onGameOver);
        socket.on(MSG_TYPES.KICK, onGameOver);
        socket.on(MSG_TYPES.BAN, onGameOver);
        socket.on(MSG_TYPES.RECEIVE_MESSAGE, receiveChatMessage);
    })
);

/** Response to the player instantiated message from the server */
function onInstantiated(stuff: any): void {
    connectionAccepted();
    startCapturingInput(stuff.x, stuff.y);
    setColor(stuff.color);
    startRendering();
    setupUi();
    setInventory(stuff.inventory);
}

// #endregion

// #region send message functions

/** Method to send the create account message to the server */
export const createaccount = (username: string, password: string): void => {
    socket.emit(MSG_TYPES.CREATE_ACCOUNT, {username: username, password: password});
};

/** Method to send the login message to the server */
export const login = (username: string, password: string): void => {
    socket.emit(MSG_TYPES.LOGIN, {username: username, password: password});
};

/** Method to send the play message to the server */
export const play = (): void => {
    socket.emit(MSG_TYPES.JOIN_GAME);
};

/** Method to send the update inputs message to the server */
export const updateInputs = throttle(10, inputs => {
    socket.emit(MSG_TYPES.INPUT, inputs);
});

/** Method to send the click message to the server */
export const click = throttle(20, info => {
    socket.emit(MSG_TYPES.CLICK, info);
});

/** Method to send the interact message to the server */
export const interact = throttle(20, info => {
    socket.emit(MSG_TYPES.INTERACT, info);
});

/** Method to send the chat message to the server */
export const chat = throttle(20, info => {
    socket.emit(MSG_TYPES.SEND_MESSAGE, info);
});

// #endregion