import { getAsset, getColoredAsset, getAssetVariant, getColoredAssetVariant } from './assets.js';
import { getCurrentState } from './state.js';
import { getSelf, setSelf } from './input.js';
import { getCell } from './world.js';
import { updateFps } from './ui.js';

const Constants = require('../shared/constants.js');
const { ASSETS, HEIGHT_TO_CELL_RATIO, CELLS_HORIZONTAL, CELLS_VERTICAL, CHUNK_SIZE, WORLD_SIZE, BACKGROUND_PADDING, BACKGROUND_SCALE, ATTACK_HITBOX_OFFSET, HIT_COLOR } = Constants;

// #region init

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const rendercanvas = document.getElementById('gamecanvas');
const rendercontext = rendercanvas.getContext('2d');

// make sure canvas width and cell size are always correct
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
rendercanvas.width = window.innerWidth;
rendercanvas.height = window.innerHeight;

let cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rendercanvas.width = window.innerWidth;
    rendercanvas.height = window.innerHeight;
    cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
});

// #endregion

// #region getters and setters

export function getCellSize(){
    return cellSize;
}

// let server set your color
let myColor;
export function setColor(color){
    myColor = color;
}

// #endregion

// #region fps data

let lastframe = Date.now();
let thisframe = Date.now();
let fpstotal = 0;
let fpscount = 0;

function calculatefps(){
    if(fpscount == 0){
        updateFps(0);
    }else{
        updateFps(fpstotal / fpscount);
    }
    
    fpstotal = 0;
    fpscount = 0;
}

// #endregion

// #region main render

// continuously runs to get max fps possible
function render(){
    // get all needed state and self info
    const state = getCurrentState();
    if(state == null){
        animationFrameRequestId = requestAnimationFrame(render);
        return;
    }

    const { others, self, entities } = state;
    setSelf(self);
    const me = getSelf();
    me.color = myColor;
    me.asset = ASSETS.PLAYER;

    // get object states (for deciding rendering order)
    const fallingplayers = others.filter(o => o.falling);
    const notfallingplayers = others.filter(o => !o.falling);
    if(me.falling){
        fallingplayers.push(me);
    }else{
        notfallingplayers.push(me);
    }

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

    fallingplayers.forEach(renderPlayer.bind(null, me));

    renderFloors(firstCell);
    renderBlocks(firstCell);

    entities.forEach(renderEntity.bind(null, me));
    notfallingplayers.forEach(renderPlayer.bind(null, me));
    others.forEach(renderPlayerUsername.bind(null, me));

    // draw frame on render canvas
    rendercontext.drawImage(canvas,0,0);

    // update fps
    thisframe = Date.now();
    fpstotal += (1000 / (thisframe - lastframe))
    fpscount++;
    lastframe = thisframe;

    // request next frame
    animationFrameRequestId = requestAnimationFrame(render);
}

// #endregion

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

// #region Entities

function renderEntity(me, entity){
    // check if entity is being hit
    let model;
    if(entity.hit){
        model = getAssetVariant(entity.asset, "hit", HIT_COLOR);
    }else{
        model = getAsset(entity.asset);
    }

    if(!model) return;

    // check if entity is swinging
    if(entity.swinging){
        renderSwing(me, entity);
    }

    // prepare context
    const { x, y, dir, scale } = entity;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.rotate(dir);
    
    // draw entity
    context.drawImage(
        model,
        -cellSize * scale / 2,
        -cellSize * scale * model.height / model.width + cellSize * scale / 2,
        cellSize * scale,
        cellSize * scale * model.height / model.width,
    );
    context.restore();
}

// #endregion

// #region Players

function renderPlayer(me, player){
    // check if player is being hit
    let model;
    if(player.hit){
        model = getColoredAssetVariant(player, "hit", HIT_COLOR);
    }else{
        model = getColoredAsset(player);
    }

    // check if player is swinging
    if(player.swinging){
        renderSwing(me, player);
    }

    // prepare context
    const { x, y, dir, scale } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);
    context.rotate(dir);
    
    // draw player
    context.drawImage(
        model,
        -cellSize * scale / 2,
        -cellSize * scale * model.height / model.width + cellSize * scale / 2,
        cellSize * scale,
        cellSize * scale * model.height / model.width,
    );
    context.restore();
}

function renderSwing(me, entity){
    // prepare context
    const { x, y, scale, lastattackdir } = entity;
    const canvasX = canvas.width / 2 + fixCoord(x + Math.sin(lastattackdir) * ATTACK_HITBOX_OFFSET) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y + Math.cos(lastattackdir) * ATTACK_HITBOX_OFFSET) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);

    // draw swing
    context.beginPath();
    context.arc(0, 0, cellSize * scale / 2, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();
    context.restore();
}

function renderPlayerUsername(me, player){
    // prepare context
    const { x, y, username } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);

    // draw username
    context.font = Math.floor(Constants.USERNAME_SCALE * cellSize).toString() + "px " + Constants.TEXT_FONT;
    context.textAlign = "center";
    context.fillText(username, 0, -Constants.USERNAME_HANG * cellSize);
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
let updatefpsinterval;

export function startRendering(){
    updatefpsinterval = setInterval(calculatefps, 500);

    animationFrameRequestId = requestAnimationFrame(render);
}

export function stopRendering(){
    clearInterval(updatefpsinterval);

    cancelAnimationFrame(animationFrameRequestId);
}

// #endregion