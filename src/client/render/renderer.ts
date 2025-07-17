import PlayerClient from "../playerClient.js";
import AssetManager from "./assetManager.js";
import ChatManager from "./chatManager.js";
import UiManager from "./uiManager.js";
import { Color } from "../../shared/types.js";
import { combineColors } from "../../shared/typeOperations.js";

import Constants from "../../shared/constants.js";
const { ASSETS, SHAPES } = Constants;

import SharedConfig from "../../configs/shared.js";
const { BASE_REACH } = SharedConfig.PLAYER;
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL, CHUNK_SIZE, WORLD_SIZE } = SharedConfig.WORLD;
const { ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;

import ClientConfig from "../../configs/client.js";
const { RENDER_PADDING, BACKGROUND_SCALE, USERNAME_HANG, USERNAME_SCALE, TEXT_FONT } = ClientConfig.RENDER;
const { HIT_COLOR } = ClientConfig.ATTACK;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);
const HEIGHT_TO_CELL_RATIO = CELLS_VERTICAL - RENDER_PADDING;

/** Handles rendering of the client game state to the screen */
class Renderer {
    private readonly playerclient: PlayerClient;

    readonly assetManager: AssetManager;
    readonly chatManager: ChatManager;
    readonly uiManager: UiManager;

    private readonly rendercanvas: HTMLCanvasElement = document.getElementById("gamecanvas")! as HTMLCanvasElement;
    private readonly rendercontext: CanvasRenderingContext2D = this.rendercanvas.getContext("2d")!;
    private readonly canvas: HTMLCanvasElement = document.createElement("canvas")!;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
    private readonly darknesscanvas: HTMLCanvasElement = document.createElement("canvas")!;
    private readonly darknesscontext: CanvasRenderingContext2D = this.darknesscanvas.getContext("2d")!;

    private cellsize: number = 0;
    private mycolor: Color = { r: 0, g: 0, b: 0 };

    private lastframe: number = Date.now();
    private thisframe: number = Date.now();
    private fpstotal: number = 0;
    private fpscount: number = 0;

    private animationframerequestid: number = 0;
    private updatefpsinterval: string | number | NodeJS.Timeout | undefined;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;

        this.assetManager = new AssetManager(playerclient);
        this.chatManager = new ChatManager(playerclient);
        this.uiManager = new UiManager(playerclient);

        // prepare canvas and cell size
        this.onResizeWindow();
        window.addEventListener("resize", this.onResizeWindow.bind(this));
    }

    // #region window management

    /** Sets the canvas and cellsize after a window resize event */
    private onResizeWindow(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.rendercanvas.width = window.innerWidth;
        this.rendercanvas.height = window.innerHeight;
        this.darknesscanvas.width = window.innerWidth;
        this.darknesscanvas.height = window.innerHeight;
        this.cellsize = this.canvas.height / HEIGHT_TO_CELL_RATIO;
    }

    // #endregion

    // #region getters

    /** Returns the rendering size of cells */
    getCellSize(): number {
        return this.cellsize;
    }

    // #endregion

    // #region setters

    /** Sets the players rendering color to the given value */
    setColor(color: Color): void {
        this.mycolor = color;
    }

    // #endregion

    // #region performance

    /** Calculates the current fps being rendered by the client */
    calculatefps(): void {
        if(this.fpscount == 0) this.uiManager.updateFps(0); else this.uiManager.updateFps(this.fpstotal / this.fpscount);
        
        this.fpstotal = 0;
        this.fpscount = 0;
    }

    // #endregion
    
    // #region main render

    /** Main render method for rendering the current (interpolated as needed) state of the loaded game world */
    private render(): void {
        // get all needed state and self info
        const state = this.playerclient.stateManager.getCurrentState();
        if(state === null){
            this.animationframerequestid = requestAnimationFrame(this.render.bind(this));
            return;
        }

        const { others = [], self, entities, darkness } = state;
        this.playerclient.inputManager.setSelf(self);
        const me: any = this.playerclient.inputManager.getSelf();
        me.color = this.mycolor;
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
            renderx: -CELLS_HORIZONTAL / 2 * this.cellsize - (this.fixCoord(me.x) - playertile.x * this.cellsize),
            rendery: -CELLS_VERTICAL / 2 * this.cellsize - (this.fixCoord(me.y) - playertile.y * this.cellsize),
        };

        // render priority goes low to high
        this.renderBackground(me, firstCell);

        fallingentities.forEach((e: any) => this.renderEntity(me, e));
        fallingplayers.forEach((p: any) => this.renderPlayer(me, p));

        this.renderFloors(firstCell);
        this.renderBlocks(firstCell, true);

        notfallingentities.forEach((e: any) => this.renderEntity(me, e));
        notfallingplayers.forEach((p: any) => this.renderPlayer(me, p));
        
        this.renderBlocks(firstCell, false);

        this.renderReach();
        this.renderDarkness(darkness, firstCell);
        
        others.forEach((p: any) => this.renderPlayerUsername(me, p));

        // draw frame on render canvas
        this.rendercontext.drawImage(this.canvas, 0, 0);

        // update fps
        this.thisframe = Date.now();
        this.fpstotal += (1000 / (this.thisframe - this.lastframe));
        this.fpscount++;
        this.lastframe = this.thisframe;

        // request next frame
        this.animationframerequestid = requestAnimationFrame(this.render.bind(this));
    }

    // #endregion

    // #region World

    /** Renders the floors of each cell within client view */
    private renderFloors(firstCell: { x: number; y: number; renderx: number; rendery: number; }): void {
        const canvasX = this.canvas.width / 2;
        const canvasY = this.canvas.height / 2;
        this.context.save();
        this.context.translate(canvasX, canvasY);

        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                const cell = this.playerclient.world.getCell(firstCell.x + dx, firstCell.y + dy);
                if(cell.block)
                    if(!cell.block.floorvisible) continue;
                if(cell.floor) this.renderCell(firstCell.renderx + dx * this.cellsize, firstCell.rendery + dy * this.cellsize, cell.floor.asset);
            }
        }

        this.context.restore();
    }

    /** Renders the blocks of each cell within client view */
    private renderBlocks(firstCell: { x: number; y: number; renderx: number; rendery: number; }, underentities: boolean): void {
        const canvasX = this.canvas.width / 2;
        const canvasY = this.canvas.height / 2;
        this.context.save();
        this.context.translate(canvasX, canvasY);

        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                const cell = this.playerclient.world.getCell(firstCell.x + dx, firstCell.y + dy);

                if(cell.block){
                    if(cell.block.underentities == underentities){
                        this.renderCell(firstCell.renderx + dx * this.cellsize, firstCell.rendery + dy * this.cellsize, cell.block.asset, cell.block.scale);
                    }
                }
            }
        }

        this.context.restore();
    }

    /** Renders the given asset onto the given cell */
    private renderCell(x: number, y: number, asset: string, scale?: number): void {
        if(scale === undefined) scale = 1;

        const renderoffset = ((1 - scale) / 2) * this.cellsize;
        x = x + renderoffset - 1;
        y = y + renderoffset - 1;
        
        const model = this.assetManager.getAsset(asset, (this.cellsize) * scale + 2);
        if(model === null) return;
        
        this.context.drawImage(
            model,
            x,
            y,
        );
    }

    // #endregion

    // #region Entities

    /** Renders the given entity */
    private renderEntity(me: any, entity: any): void {
        // check if entity is swinging
        if(entity.swinging) this.renderSwing(me, entity);

        // prepare context
        const { x, y, dir, scale } = entity;
        const canvasX = this.canvas.width / 2 + this.fixCoord(x) - this.fixCoord(me.x);
        const canvasY = this.canvas.height / 2 + this.fixCoord(y) - this.fixCoord(me.y);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(dir);
        
        // get model
        const model = entity.hit ? this.assetManager.getAsset(entity.asset, this.cellsize * scale, HIT_COLOR) : this.assetManager.getAsset(entity.asset, this.cellsize * scale);
        
        // draw entity
        if(model !== null) this.context.drawImage(
            model,
            -this.cellsize * scale / 2,
            -this.cellsize * scale * model.height / model.width + this.cellsize * scale / 2,
        );
        this.context.restore();
    }

    // #endregion

    // #region Players

    /** Renders the given player entity */
    private renderPlayer(me: any, player: any): void {
        // check if player is swinging
        if(player.swinging) this.renderSwing(me, player);

        // prepare context
        const { x, y, dir, scale } = player;
        const canvasX = this.canvas.width / 2 + this.fixCoord(x) - this.fixCoord(me.x);
        const canvasY = this.canvas.height / 2 + this.fixCoord(y) - this.fixCoord(me.y);
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.rotate(dir);

        // get player model
        const model = player.hit ? this.assetManager.getAsset(player.asset, this.cellsize * scale, combineColors(player.color, HIT_COLOR)) : this.assetManager.getAsset(player.asset, this.cellsize * scale, player.color);

        // draw player
        if(model !== null) this.context.drawImage(
            model,
            -this.cellsize * scale / 2,
            -this.cellsize * scale * model.height / model.width + this.cellsize * scale / 2,
        );
        this.context.restore();
    }

    /** Renders the given entity's swing animation */
    private renderSwing(me: any, entity: any): void {
        // prepare context
        const { x, y, scale, lastattackdir } = entity;
        const canvasX = this.canvas.width / 2 + this.fixCoord(x + Math.sin(lastattackdir) * ATTACK_HITBOX_OFFSET) - this.fixCoord(me.x);
        const canvasY = this.canvas.height / 2 + this.fixCoord(y + Math.cos(lastattackdir) * ATTACK_HITBOX_OFFSET) - this.fixCoord(me.y);
        this.context.save();
        this.context.translate(canvasX, canvasY);

        // draw swing
        this.context.beginPath();
        this.context.arc(0, 0, this.cellsize * scale / 2, 0, 2 * Math.PI);
        this.context.fillStyle = "white";
        this.context.fill();
        this.context.restore();
    }

    /** Renders the given player's username above them */
    private renderPlayerUsername(me: any, player: any): void {
        // prepare context
        const { x, y, username } = player;
        const canvasX = this.canvas.width / 2 + this.fixCoord(x) - this.fixCoord(me.x);
        const canvasY = this.canvas.height / 2 + this.fixCoord(y) - this.fixCoord(me.y);
        this.context.save();
        this.context.translate(canvasX, canvasY);

        // draw username
        this.context.font = Math.floor(USERNAME_SCALE * this.cellsize).toString() + "px " + TEXT_FONT;
        this.context.textAlign = "center";
        this.context.fillText(username, 0, -USERNAME_HANG * this.cellsize);
        this.context.restore();
    }

    /** Renders the reach outline for the current held item or hovered object */
    private renderReach(): void {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = BASE_REACH * this.cellsize;
        const startAngle = 0;
        const endAngle = 2 * Math.PI;

        this.context.save();
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius, startAngle, endAngle);
        this.context.strokeStyle = "rgba(190, 190, 190, 0.35)";
        
        this.context.lineWidth = 10;
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }

    // #endregion

    // #region Background

    /** Renders darkness overlay on top of the world */
    private renderDarkness(percent: number, firstCell: { x: number; y: number; renderx: number; rendery: number; }){
        if(percent === 0) return;

        // draw base darkness
        this.darknesscontext.clearRect(0, 0, this.darknesscanvas.width, this.darknesscanvas.height);
        this.darknesscontext.fillStyle = `rgba(0, 0, 0, ${(0.25 * percent).toFixed(3)})`;
        this.darknesscontext.fillRect(0, 0, this.darknesscanvas.width, this.darknesscanvas.height);

        // remove darkness around light sources
        const canvasX = this.darknesscanvas.width / 2;
        const canvasY = this.darknesscanvas.height / 2;
        this.darknesscontext.save();
        this.darknesscontext.translate(canvasX, canvasY);
        this.darknesscontext.globalCompositeOperation = "destination-out";
        this.darknesscontext.fillStyle = "rgba(0, 0, 0, 1.0)";
        
        const padding = 10;
        for(let dx = -padding; dx < CELLS_HORIZONTAL + padding; dx++){
            for(let dy = -padding; dy < CELLS_VERTICAL + padding; dy++){
                const cell = this.playerclient.world.getCell(firstCell.x + dx, firstCell.y + dy);
                if(!cell.block) continue;
                if(!cell.block.light) continue;

                const x = firstCell.renderx + (dx + .5) * this.cellsize;
                const y = firstCell.rendery + (dy + .5) * this.cellsize;
                const radius = cell.block.light * this.cellsize;

                this.darknesscontext.beginPath();
                this.darknesscontext.arc(x, y, radius, 0, 2 * Math.PI, false);
                this.darknesscontext.fill();
            }
        }

        this.darknesscontext.restore();

        // draw darkness on render canvas
        this.context.drawImage(this.darknesscanvas, 0, 0);
    }

    /** Renders the background image under the world */
    private renderBackground(me: any, firstCell: { x: number; y: number; renderx: number; rendery: number; }): void {
        // check if need to render background
        let renderbg = false;
        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            if(renderbg) break;

            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                const cell = this.playerclient.world.getCell(firstCell.x + dx, firstCell.y + dy);
                if(cell.block)
                    if(cell.block.scale == 1 && cell.block.shape == SHAPES.SQUARE) continue;
                if(cell.floor) continue;

                renderbg = true;
                break;
            }
        }

        if(!renderbg) return;

        // render background
        const worldSize = CHUNK_SIZE * WORLD_SIZE / 2 + HEIGHT_TO_CELL_RATIO * 2;
        const xpercent = -(me.x / worldSize);
        const ypercent = -(me.y / worldSize);

        const scale = this.canvas.height * BACKGROUND_SCALE;
        const extraspace = (scale - this.canvas.height) / 2;
        const xoffset = xpercent * extraspace;
        const yoffset = ypercent * extraspace;
        
        const model = this.assetManager.getAsset(ASSETS.SPACE_BG, scale, undefined, true);
        if(model === null) return;

        const canvasX = this.canvas.width / 2;
        const canvasY = this.canvas.height / 2;
        this.context.save();
        this.context.translate(canvasX, canvasY);
        this.context.drawImage(
            model,
            -scale * (model.width / model.height) / 2 + xoffset,
            -scale / 2 + yoffset,
        );
        this.context.restore();
    }

    // #endregion

    // #region Helpers

    /** Returns the given cell coordinate as a screen coordinate */
    fixCoord(x: number): number {
        return x * this.cellsize;
    }

    // #endregion

    // #region Exports

    /** Starts the rendering loop for the client */
    startRendering(): void {
        this.context.reset();
        this.updatefpsinterval = setInterval(this.calculatefps.bind(this), 500);
        this.animationframerequestid = requestAnimationFrame(this.render.bind(this));
    }

    /** Stops the rendering loop for the client */
    stopRendering(): void {
        clearInterval(this.updatefpsinterval);
        cancelAnimationFrame(this.animationframerequestid);
    }

    // #endregion
}

export default Renderer;
