import { getAsset, getColoredAsset } from './assets.js';
import { getCurrentState } from './state.js';
import { getSelf } from './input.js';
import { getCell } from './world.js';

const Constants = require('../shared/constants.js');
const { ASSETS, PLAYER_SCALE, HEIGHT_TO_CELL_RATIO, CELLS_HORIZONTAL, CELLS_VERTICAL, CHUNK_SIZE, WORLD_SIZE, BACKGROUND_PADDING, BACKGROUND_SCALE } = Constants;

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

export function getCellSize(){
    return cellSize;
}

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
    me.asset = ASSETS.PLAYER;

    // get the actual tile the player is in
    const playertile = {
        x: Math.floor(me.x),
        y: Math.floor(me.y),
    };
    const firstCell = {
        x: playertile.x - CELLS_HORIZONTAL / 2,
        y: playertile.y - CELLS_VERTICAL / 2,
        renderx: -CELLS_HORIZONTAL / 2 * cellSize - (fixCoord(me.x) - playertile.x * cellSize),
        rendery: -CELLS_VERTICAL / 2 * cellSize - (fixCoord(me.y) - playertile.y * cellSize),
    };

    // render priority goes low to high
    renderBackground(me);

    renderFloors(firstCell);
    renderBlocks(firstCell);
    others.forEach(renderPlayer.bind(null, me));
    renderPlayer(me, me);
    others.forEach(renderPlayerUsername.bind(null, me));

    // request next frame
    animationFrameRequestId = requestAnimationFrame(render);
}

// #region World

function renderFloors(firstCell){
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);

    for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
        for(let dy = 0; dy < CELLS_VERTICAL; dy++){
            const cell = getCell(firstCell.x + dx, firstCell.y + dy);
            if(cell.floor){
                renderCell(firstCell.renderx + dx * cellSize, firstCell.rendery + dy * cellSize, cell.floor.asset);
            }
        }
    }

    context.restore();
}

function renderBlocks(firstCell){
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);

    for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
        for(let dy = 0; dy < CELLS_VERTICAL; dy++){
            const cell = getCell(firstCell.x + dx, firstCell.y + dy);
            if(cell.block){
                renderCell(firstCell.renderx + dx * cellSize, firstCell.rendery + dy * cellSize, cell.block.asset);
            }
        }
    }

    context.restore();
}

function renderCell(x, y, asset){
    context.drawImage(
        getAsset(asset),
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

    const model = getColoredAsset(player);

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

// #region Background

function renderBackground(me){
    const model = getAsset(ASSETS.SPACE_BG);

    const worldSize = CHUNK_SIZE * WORLD_SIZE / 2;
    const xpercent = -(me.x / worldSize);
    const ypercent = -(me.y / worldSize);

    const scale = cellSize * ((BACKGROUND_SCALE - HEIGHT_TO_CELL_RATIO) / 2 - BACKGROUND_PADDING);
    const xoffset = xpercent * scale;
    const yoffset = ypercent * scale;

    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);
    context.drawImage(
        model,
        -cellSize * BACKGROUND_SCALE * (model.width / model.height) / 2 + xoffset,
        -cellSize * BACKGROUND_SCALE / 2 + yoffset,
        cellSize * BACKGROUND_SCALE * (model.width / model.height),
        cellSize * BACKGROUND_SCALE,
    );
    context.restore();
}

// #endregion

// #region Helpers

function fixCoord(x){
    return x * cellSize;
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