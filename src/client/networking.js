import io from 'socket.io-client';
import { processGameUpdate } from './state.js';
import { throttle } from 'throttle-debounce';
import { startRendering, setColor } from './render.js';
import { startCapturingInput } from './input.js';
import { setupUi } from './ui.js';
import { receiveChatMessage } from './chat.js';
import { onlogin, connectionRefused, connectionAccepted } from './index.js';
import { setInventory } from './inventory.js';

import Constants from '../shared/constants.ts';
const { MSG_TYPES } = Constants;

// #region init

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
});

export const connect = onGameOver => (
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

function onInstantiated(stuff){
    connectionAccepted();
    startCapturingInput(stuff.x, stuff.y);
    setColor(stuff.color);
    startRendering();
    setupUi();
    setInventory(stuff.inventory);
}

// #endregion

// #region send message functions

export const createaccount = (username, password) => {
    socket.emit(MSG_TYPES.CREATE_ACCOUNT, {username: username, password: password});
};

export const login = (username, password) => {
    socket.emit(MSG_TYPES.LOGIN, {username: username, password: password});
};

export const play = () => {
    socket.emit(MSG_TYPES.JOIN_GAME);
};

export const updateInputs = throttle(20, inputs => {
    socket.emit(MSG_TYPES.INPUT, inputs);
});

export const click = throttle(20, info => {
    socket.emit(MSG_TYPES.CLICK, info);
});

export const interact = throttle(20, info => {
    socket.emit(MSG_TYPES.INTERACT, info);
});

export const chat = throttle(20, info => {
    socket.emit(MSG_TYPES.SEND_MESSAGE, info);
});

// #endregion