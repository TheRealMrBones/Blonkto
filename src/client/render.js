import { getAsset } from './assets.js';
import { getCurrentState } from './state.js';

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

let Me = null;

function render() {
    if(getCurrentState() == null){
        animationFrameRequestId = requestAnimationFrame(render);
        return;
    }
    const { me, others } = getCurrentState();

    if (me) {
        Me = me;
        renderBG(me);
        others.forEach(renderPlayer.bind(null, me));
        renderPlayer(me, me);
    }

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
        getAsset('bluePlayer.png'),
        -canvas.height / PLAYER_SCALE / 2,
        -canvas.height / PLAYER_SCALE * getAsset('bluePlayer.png').height / getAsset('bluePlayer.png').width + canvas.height / PLAYER_SCALE / 2,
        canvas.height / PLAYER_SCALE,
        canvas.height / PLAYER_SCALE * getAsset('bluePlayer.png').height / getAsset('bluePlayer.png').width,
    );
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