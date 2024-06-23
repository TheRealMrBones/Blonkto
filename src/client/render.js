import { getAsset } from './assets.js';
import { getCurrentState } from './state.js';
import { getSelf } from './input.js';

const Constants = require('../shared/constants.js');
const { NATIVE_RESOLUTION, PLAYER_SCALE } = Constants;

const canvas = document.getElementById('gamecanvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function render() {
    if(getCurrentState() == null){
        animationFrameRequestId = requestAnimationFrame(render);
        return;
    }
    const { others } = getCurrentState();
    const me = getSelf();

    renderBG(me);
    others.forEach(renderPlayer.bind(null, me));
    others.forEach(renderPlayerUsername.bind(null, me));
    renderPlayer(me, me);

    animationFrameRequestId = requestAnimationFrame(render);
}

function renderBG(me){
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);
    context.drawImage(
        getAsset('tiles.png'),
        -canvas.width / 2 - fixCoord(me.x) % (canvas.height / 9) - (canvas.height / 9) * 2 + (canvas.width / 2) % (canvas.height / 9),
        -canvas.height / 2 - fixCoord(me.y) % (canvas.height / 9) - (canvas.height / 9),
        canvas.height / 9 * 24,
        canvas.height / 9 * 13,
    );
    context.restore();
}

function renderPlayer(me, player){
    const { x, y, dir } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.rotate(dir);
    context.drawImage(
        getAsset('BlonktoPlayer.png'),
        -canvas.height / PLAYER_SCALE / 2,
        -canvas.height / PLAYER_SCALE * getAsset('BlonktoPlayer.png').height / getAsset('BlonktoPlayer.png').width + canvas.height / PLAYER_SCALE / 2,
        canvas.height / PLAYER_SCALE,
        canvas.height / PLAYER_SCALE * getAsset('BlonktoPlayer.png').height / getAsset('BlonktoPlayer.png').width,
    );
    context.restore();
}

function renderPlayerUsername(me, player){
    const { x, y, username } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.font = "48px serif";
    context.textAlign = "center";
    context.strokeText(username, 0, -Constants.PLAYER_USERNAME_HEIGHT);
    context.restore();
}

function fixCoord(x){
    return x * canvas.height / NATIVE_RESOLUTION;
}

let animationFrameRequestId;

export function startRendering() {
    animationFrameRequestId = requestAnimationFrame(render);
}

export function stopRendering() {
    cancelAnimationFrame(animationFrameRequestId);
}