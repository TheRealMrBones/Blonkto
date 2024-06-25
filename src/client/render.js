import { getAsset } from './assets.js';
import { getCurrentState } from './state.js';
import { getSelf } from './input.js';

const Constants = require('../shared/constants.js');
const { ASSETS, PLAYER_SCALE, HEIGHT_TO_CELL_RATIO, CELLS_HORIZONTAL, CELLS_VERTICAL } = Constants;

const canvas = document.getElementById('gamecanvas');
const context = canvas.getContext('2d');

// make sure canvas width and cell size are always correct
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
});

// let server set your color
let myColor;
export function setColor(color){
    myColor = color;
}

// continuously runs to get max fps possible
function render(){
    // get all needed state and self info
    if(getCurrentState() == null){
        animationFrameRequestId = requestAnimationFrame(render);
        return;
    }
    const { others } = getCurrentState();
    const me = getSelf();
    me.color = myColor;

    // get the actual tile the player is in
    const playertile = {
        x: Math.floor(fixCoord(me.x) / cellSize),
        y: Math.floor(fixCoord(me.y) / cellSize),
    };
    const firstCell = {
        x: playertile.x - CELLS_HORIZONTAL / 2,
        y: playertile.y - CELLS_VERTICAL / 2,
        renderx: -CELLS_HORIZONTAL / 2 * cellSize - fixCoord(me.x) % cellSize,
        rendery: -CELLS_VERTICAL / 2 * cellSize - fixCoord(me.y) % cellSize,
    };

    // render priority goes low to high
    renderFloor(firstCell);


    others.forEach(renderPlayer.bind(null, me));
    renderPlayer(me, me);
    others.forEach(renderPlayerUsername.bind(null, me));

    // request next frame
    animationFrameRequestId = requestAnimationFrame(render);
}

// #region World

function renderFloor(firstCell){
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);

    for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
        for(let dy = 0; dy < CELLS_VERTICAL; dy++){
            renderTile(firstCell.renderx + dx * cellSize, firstCell.rendery + dy * cellSize);
        }
    }

    context.restore();
}

function renderTile(x, y){
    context.drawImage(
        getAsset(ASSETS.TILE),
        x,
        y,
        cellSize,
        cellSize,
    );
}

// #endregion

// #region Players

function renderPlayer(me, player){
    const { x, y, dir } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.rotate(dir);

    const model = colorize(getAsset(ASSETS.PLAYER), player.color.r, player.color.g, player.color.b);

    context.drawImage(
        model,
        -cellSize * PLAYER_SCALE / 2,
        -cellSize * PLAYER_SCALE * model.height / model.width + cellSize * PLAYER_SCALE / 2,
        cellSize * PLAYER_SCALE,
        cellSize * PLAYER_SCALE * model.height / model.width,
    );
    context.restore();
}

function renderPlayerUsername(me, player){
    const { x, y, username } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.font = Constants.TEXT_FONT;
    context.textAlign = "center";
    context.fillText(username, 0, -Constants.PLAYER_USERNAME_HEIGHT);
    context.restore();
}

// #endregion

// #region Helpers

function fixCoord(x){
    return x * cellSize;
}

const colorize = (image, r, g, b) => {
    const imageWidth = image.width;
    const imageHeight = image.height;

    const offscreen = new OffscreenCanvas(imageWidth, imageHeight);
    const ctx = offscreen.getContext("2d");

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

    for(let i = 0; i < imageData.data.length; i += 4){
        imageData.data[i + 0] *= r;
        imageData.data[i + 1] *= g;
        imageData.data[i + 2] *= b;
    }

    ctx.putImageData(imageData, 0, 0);

    return offscreen;
}

// #endregion

// #region Exports

let animationFrameRequestId;

export function startRendering(){
    animationFrameRequestId = requestAnimationFrame(render);
}

export function stopRendering(){
    cancelAnimationFrame(animationFrameRequestId);
}

// #endregion