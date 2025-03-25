import { getAsset, getColoredAsset, getAssetVariant, getColoredAssetVariant } from "./assets.js";
import { getCurrentState } from "../networking/state.js";
import { getSelf, setSelf } from "../input/input.js";
import { getCell } from "../world/world.js";
import { updateFps } from "./ui.js";
import { Color } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { CELLS_HORIZONTAL, CELLS_VERTICAL, CHUNK_SIZE, WORLD_SIZE } = SharedConfig.WORLD;
const { ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;

import ClientConfig from "../../configs/client.js";
const { HEIGHT_TO_CELL_RATIO, BACKGROUND_PADDING, BACKGROUND_SCALE, USERNAME_HANG, USERNAME_SCALE, TEXT_FONT } = ClientConfig.RENDER;
const { HIT_COLOR } = ClientConfig.ATTACK;

// #region init

const canvas = document.createElement("canvas")!;
const context = canvas.getContext("2d")!;
const rendercanvas = document.getElementById("gamecanvas")! as HTMLCanvasElement;
const rendercontext = rendercanvas.getContext("2d")!;

// make sure canvas width and cell size are always correct
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
rendercanvas.width = window.innerWidth;
rendercanvas.height = window.innerHeight;

let cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rendercanvas.width = window.innerWidth;
    rendercanvas.height = window.innerHeight;
    cellSize = canvas.height / HEIGHT_TO_CELL_RATIO;
});

// #endregion

// #region getters and setters

/** Returns the cell render size in pixels */
export function getCellSize(): number {
    return cellSize;
}

// let server set your color
let myColor: Color;

/** Sets your own color in game to the given color */
export function setColor(color: Color): void {
    myColor = color;
}

// #endregion

// #region fps data

let lastframe = Date.now();
let thisframe = Date.now();
let fpstotal = 0;
let fpscount = 0;

/** Calculates and shows your clients average fps */
function calculatefps(): void {
    if(fpscount == 0) updateFps(0); else updateFps(fpstotal / fpscount);
    
    fpstotal = 0;
    fpscount = 0;
}

// #endregion

// #region main render

/** Main render method for rendering the current (interpolated as needed) state of the loaded game world */
function render(): void {
    // get all needed state and self info
    const state = getCurrentState();
    if(state === null){
        animationFrameRequestId = requestAnimationFrame(render);
        return;
    }

    const { others = [], self, entities } = state;
    setSelf(self);
    const me: any = getSelf();
    me.color = myColor;
    me.asset = ASSETS.PLAYER;

    // get object states (for deciding rendering order)
    const fallingplayers = others.filter((o: any) => o.falling);
    const notfallingplayers = others.filter((o: any) => !o.falling);
    if(me.falling){
        fallingplayers.push(me);
    }else{
        notfallingplayers.push(me);
    }

    const fallingentities = entities.filter((e: any) => e.falling);
    const notfallingentities = entities.filter((e: any) => !e.falling);

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

    fallingentities.forEach(renderEntity.bind(null, me));
    fallingplayers.forEach(renderPlayer.bind(null, me));

    renderFloors(firstCell);
    renderBlocks(firstCell);

    notfallingentities.forEach(renderEntity.bind(null, me));
    notfallingplayers.forEach(renderPlayer.bind(null, me));
    others.forEach(renderPlayerUsername.bind(null, me));

    // draw frame on render canvas
    rendercontext.drawImage(canvas,0,0);

    // update fps
    thisframe = Date.now();
    fpstotal += (1000 / (thisframe - lastframe));
    fpscount++;
    lastframe = thisframe;

    // request next frame
    animationFrameRequestId = requestAnimationFrame(render);
}

// #endregion

// #region World

/** Renders the floors of each cell within client view */
function renderFloors(firstCell: { x: number; y: number; renderx: number; rendery: number; }): void {
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);

    for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
        for(let dy = 0; dy < CELLS_VERTICAL; dy++){
            const cell = getCell(firstCell.x + dx, firstCell.y + dy);
            if(cell.block)
                if(cell.block.scale == 1 && cell.block.shape == SHAPES.SQUARE) continue;
            if(cell.floor) renderCell(firstCell.renderx + dx * cellSize, firstCell.rendery + dy * cellSize, cell.floor.asset);
        }
    }

    context.restore();
}

/** Renders the blocks of each cell within client view */
function renderBlocks(firstCell: { x: number; y: number; renderx: number; rendery: number; }): void {
    const canvasX = canvas.width / 2;
    const canvasY = canvas.height / 2;
    context.save();
    context.translate(canvasX, canvasY);

    for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
        for(let dy = 0; dy < CELLS_VERTICAL; dy++){
            const cell = getCell(firstCell.x + dx, firstCell.y + dy);
            if(cell.block) renderCell(firstCell.renderx + dx * cellSize, firstCell.rendery + dy * cellSize, cell.block.asset, cell.block.scale);
        }
    }

    context.restore();
}

/** Renders the given asset onto the given cell */
function renderCell(x: number, y: number, asset: string, scale?: number): void {
    if(scale !== undefined){
        const renderoffset = ((1 - scale) / 2) * cellSize;
        x = x + renderoffset;
        y = y + renderoffset;
    }

    const renderscale = scale ? scale : 1;
    context.drawImage(
        getAsset(asset),
        x + 1,
        y + 1,
        (cellSize + 1) * renderscale,
        (cellSize + 1) * renderscale,
    );
}

// #endregion

// #region Entities

/** Renders the given entity */
function renderEntity(me: any, entity: any): void {
    // check if entity is being hit
    const model = entity.hit ? getAssetVariant(entity.asset, "hit", HIT_COLOR) : getAsset(entity.asset);
    if(!model) return;

    // check if entity is swinging
    if(entity.swinging) renderSwing(me, entity);

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

/** Renders the given player entity */
function renderPlayer(me: any, player: any): void {
    // check if player is being hit
    const model = player.hit ? getColoredAssetVariant(player, "hit", HIT_COLOR) : getColoredAsset(player);

    // check if player is swinging
    if(player.swinging) renderSwing(me, player);

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

/** Renders the given entity's swing animation */
function renderSwing(me: any, entity: any): void {
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

/** Renders the given player's username above them */
function renderPlayerUsername(me: any, player: any): void {
    // prepare context
    const { x, y, username } = player;
    const canvasX = canvas.width / 2 + fixCoord(x) - fixCoord(me.x);
    const canvasY = canvas.height / 2 + fixCoord(y) - fixCoord(me.y);
    context.save();
    context.translate(canvasX, canvasY);

    // draw username
    context.font = Math.floor(USERNAME_SCALE * cellSize).toString() + "px " + TEXT_FONT;
    context.textAlign = "center";
    context.fillText(username, 0, -USERNAME_HANG * cellSize);
    context.restore();
}

// #endregion

// #region Background

/** Renders the background image under the world */
function renderBackground(me: any): void {
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

/** Returns the given cell coordinate as a screen coordinate */
function fixCoord(x: number): number {
    return x * cellSize;
}

// #endregion

// #region Exports

let animationFrameRequestId: number;
let updatefpsinterval: string | number | NodeJS.Timeout | undefined;

/** Starts the rendering loop for the client */
export function startRendering(): void {
    updatefpsinterval = setInterval(calculatefps, 500);
    animationFrameRequestId = requestAnimationFrame(render);
}

/** Stops the rendering loop for the client */
export function stopRendering(): void {
    clearInterval(updatefpsinterval);
    cancelAnimationFrame(animationFrameRequestId);
}

// #endregion