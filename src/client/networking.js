import io from 'socket.io-client';
import { processGameUpdate } from './state.js';
import { throttle } from 'throttle-debounce';
import { startRendering, setColor } from './render.js';
import { startCapturingInput } from './input.js';

const Constants = require('../shared/constants.js');
const { MSG_TYPES } = Constants;

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
        socket.on(MSG_TYPES.GAME_UPDATE, processGameUpdate);
        socket.on(MSG_TYPES.DEAD, onGameOver);
        socket.on(MSG_TYPES.PLAYER_INSTANTIATED, onInstantiated);
    })
);

function onInstantiated(stuff){
    startCapturingInput(stuff.x, stuff.y);
    setColor(stuff.color);
    startRendering();
}

export const play = username => {
    socket.emit(MSG_TYPES.JOIN_GAME, username);
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