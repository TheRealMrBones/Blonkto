import PlayerClient from "client/playerClient.js";
import AssetManager from "client/render/asset/assetManager.js";
import ChatManager from "client/render/ui/chatManager.js";
import UiManager from "client/render/ui/uiManager.js";
import ClientConfig from "configs/client.js";
import SharedConfig from "configs/shared.js";
import Constants from "shared/constants.js";
import V2D from "shared/physics/vector2d.js";
import { combineColors } from "shared/typeOperations.js";
import { Color, Vector2D } from "shared/types.js";

const { ASSETS, SHAPES, GAME_MODES } = Constants;
const { BASE_REACH } = SharedConfig.PLAYER;
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL, CHUNK_SIZE, WORLD_SIZE } = SharedConfig.WORLD;
const { ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;
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

    private readonly canvas: HTMLCanvasElement = document.createElement("canvas")!;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
    private readonly rendercanvas: HTMLCanvasElement = document.getElementById("gamecanvas")! as HTMLCanvasElement;
    private readonly rendercontext: CanvasRenderingContext2D = this.rendercanvas.getContext("2d")!;
    private readonly worldundercanvas: HTMLCanvasElement = document.createElement("canvas")!;
    private readonly worldundercontext: CanvasRenderingContext2D = this.worldundercanvas.getContext("2d")!;
    private readonly worlduppercanvas: HTMLCanvasElement = document.createElement("canvas")!;
    private readonly worlduppercontext: CanvasRenderingContext2D = this.worlduppercanvas.getContext("2d")!;
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

    private rendercell: Vector2D | null = null;

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

        this.cellsize = Math.floor(this.canvas.height / HEIGHT_TO_CELL_RATIO);
        this.rendercell = null;

        this.worldundercanvas.width = CELLS_HORIZONTAL * this.cellsize;
        this.worldundercanvas.height = CELLS_VERTICAL * this.cellsize;
        this.worlduppercanvas.width = CELLS_HORIZONTAL * this.cellsize;
        this.worlduppercanvas.height = CELLS_VERTICAL * this.cellsize;
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

    /** Resets the rendercell for the renderer */
    resetRenderCell(): void {
        this.rendercell = null;
    }

    // #endregion

    // #region performance

    /** Calculates the current fps being rendered by the client */
    calculatefps(): void {
        if(this.fpscount == 0) this.uiManager.uiinfo.updateFps(0); else this.uiManager.uiinfo.updateFps(this.fpstotal / this.fpscount);

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

        if(this.playerclient.getGamemode() != GAME_MODES.SPECTATOR){
            if(me.falling){
                fallingplayers.push(me);
            }else{
                notfallingplayers.push(me);
            }
        }

        const fallingentities = entities.filter((e: any) => e.falling);
        const notfallingentities = entities.filter((e: any) => !e.falling);

        // get the render cell and old render cell
        const oldrendercell = this.rendercell;
        this.rendercell = [Math.floor(me.x), Math.floor(me.y)];

        const firstcell = this.getFirstRenderCell(me, this.rendercell);

        // update the world canvas if there is a change in render cell
        if(oldrendercell == null){
            this.renderWorld(firstcell);
        }else if(!V2D.areEqual(oldrendercell, this.rendercell)){
            this.shiftWorldRender(oldrendercell, firstcell);
        }else{
            for(let x = firstcell.x; x < firstcell.x + CELLS_HORIZONTAL; x++){
                for(let y = firstcell.y; y < firstcell.y + CELLS_VERTICAL; y++){
                    const cell = this.playerclient.world.getCell(x, y);
                    if(cell.animated) this.renderCellUpdates(x, y, cell);
                }
            }
        }

        // render priority goes low to high
        this.renderBackground(me, firstcell);

        fallingentities.forEach((e: any) => this.renderEntity(me, e));
        fallingplayers.forEach((p: any) => this.renderPlayer(me, p));

        this.renderWorldOnto(true, firstcell);

        notfallingentities.forEach((e: any) => this.renderEntity(me, e));
        notfallingplayers.forEach((p: any) => this.renderPlayer(me, p));

        this.renderWorldOnto(false, firstcell);

        this.renderReach();
        this.renderDarkness(darkness, firstcell);

        others.forEach((p: any) => this.renderPlayerUsername(me, p));

        this.uiManager.renderUi(this.context);

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

    /** Renders the world from the world canvas onto the main canvas */
    private renderWorldOnto(underentities: boolean, firstcell: FirstRenderCell): void {
        const canvasX = this.canvas.width / 2;
        const canvasY = this.canvas.height / 2;
        this.context.save();
        this.context.translate(canvasX, canvasY);

        this.context.drawImage(underentities ? this.worldundercanvas : this.worlduppercanvas, firstcell.renderx, firstcell.rendery);

        this.context.restore();
    }

    /** Renders the world onto the world canvases */
    private renderWorld(firstcell: FirstRenderCell): void {
        // clear world canvases
        this.worldundercontext.clearRect(0, 0, this.worldundercanvas.width, this.worldundercanvas.height);
        this.worlduppercontext.clearRect(0, 0, this.worlduppercanvas.width, this.worlduppercanvas.height);

        // render world under
        this.renderFloors(firstcell);
        this.renderBlocks(firstcell, true);

        // render world upper
        this.renderBlocks(firstcell, false);
    }

    /** Shifts the world renders on the world canvases from the old cell to the new cell */
    private shiftWorldRender(oldrendercell: Vector2D, firstcell: FirstRenderCell): void {
        // shift old world render
        const worldundercanvasold = document.createElement("canvas")!;
        const worldundercontextold = worldundercanvasold.getContext("2d")!;
        const worlduppercanvasold = document.createElement("canvas")!;
        const worlduppercontextold = worlduppercanvasold.getContext("2d")!;

        worldundercanvasold.width = CELLS_HORIZONTAL * this.cellsize;
        worldundercanvasold.height = CELLS_VERTICAL * this.cellsize;
        worlduppercanvasold.width = CELLS_HORIZONTAL * this.cellsize;
        worlduppercanvasold.height = CELLS_VERTICAL * this.cellsize;

        worldundercontextold.drawImage(this.worldundercanvas, 0, 0);
        worlduppercontextold.drawImage(this.worlduppercanvas, 0, 0);

        this.worldundercontext.clearRect(0, 0, this.worldundercanvas.width, this.worldundercanvas.height);
        this.worlduppercontext.clearRect(0, 0, this.worlduppercanvas.width, this.worlduppercanvas.height);

        const newx = oldrendercell[0] - (firstcell.x + CELLS_HORIZONTAL / 2);
        const newy = oldrendercell[1] - (firstcell.y + CELLS_VERTICAL / 2);

        this.worldundercontext.drawImage(worldundercanvasold, newx * this.cellsize, newy * this.cellsize);
        this.worlduppercontext.drawImage(worlduppercanvasold, newx * this.cellsize, newy * this.cellsize);

        // render over old render
        const startx = Math.max(0, newx);
        const starty = Math.max(0, newy);
        const endx = Math.min(CELLS_HORIZONTAL, newx + CELLS_HORIZONTAL);
        const endy = Math.min(CELLS_VERTICAL, newy + CELLS_VERTICAL);

        for(let x = startx; x < endx; x++){
            for(let y = starty; y < endy; y++){
                const cellx = x + firstcell.x;
                const celly = y + firstcell.y;

                const cell = this.playerclient.world.getCell(cellx, celly);
                if(cell.animated) this.renderCellUpdates(cellx, celly, cell);
            }
        }

        // render world under
        this.renderFloors(firstcell, newx, newy);
        this.renderBlocks(firstcell, true, newx, newy);

        // render world upper
        this.renderBlocks(firstcell, false, newx, newy);
    }

    /** Renders the floors of each cell within client view */
    private renderFloors(firstcell: FirstRenderCell, newx?: number, newy?: number): void {
        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                if(newx !== undefined && newy !== undefined){
                    if(dx >= newx && dx < newx + CELLS_HORIZONTAL &&
                        dy >= newy && dy < newy + CELLS_VERTICAL){
                        continue;
                    }
                }

                const cellx = firstcell.x + dx;
                const celly = firstcell.y + dy;

                const cell = this.playerclient.world.getCell(cellx, celly);

                if(cell.block)
                    if(!cell.block.floorvisible) continue;
                if(cell.floor){
                    const id = `${cellx}_${celly}_f`;
                    this.renderCell(this.worldundercontext, dx, dy, cell.floor.asset, id);
                }
            }
        }
    }

    /** Renders the blocks of each cell within client view */
    private renderBlocks(firstcell: FirstRenderCell, underentities: boolean, newx?: number, newy?: number): void {
        const context = underentities ? this.worldundercontext : this.worlduppercontext;

        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                if(newx !== undefined && newy !== undefined){
                    if(dx >= newx && dx < newx + CELLS_HORIZONTAL &&
                        dy >= newy && dy < newy + CELLS_VERTICAL){
                        continue;
                    }
                }

                const cellx = firstcell.x + dx;
                const celly = firstcell.y + dy;

                const cell = this.playerclient.world.getCell(cellx, celly);

                if(cell.block){
                    if(cell.block.underentities == underentities){
                        const id = `${cellx}_${celly}_b`;
                        this.renderCell(context, dx, dy, cell.block.asset, id, cell.block.scale);
                    }
                }
            }
        }
    }

    /** Renders updates to the given cell */
    renderCellUpdates(x: number, y: number, cell: any): void {
        if(this.rendercell === null) return;

        const realx = x - (this.rendercell[0] - CELLS_HORIZONTAL / 2);
        const realy = y - (this.rendercell[1] - CELLS_VERTICAL / 2);

        if(realx >= 0 && realx < CELLS_HORIZONTAL &&
            realy >= 0 && realy < CELLS_VERTICAL){
            //clear
            this.worldundercontext.clearRect(realx * this.cellsize, realy * this.cellsize, this.cellsize, this.cellsize);
            this.worlduppercontext.clearRect(realx * this.cellsize, realy * this.cellsize, this.cellsize, this.cellsize);

            // floor
            let renderfloor = true;
            if(cell.block)
                if(!cell.block.floorvisible) renderfloor = false;
            if(cell.floor && renderfloor){
                const id = `${x}_${y}_f`;
                this.renderCell(this.worldundercontext, realx, realy, cell.floor.asset, id);
            }

            // block
            if(cell.block){
                const context = cell.block.underentities ? this.worldundercontext : this.worlduppercontext;
                const id = `${x}_${y}_b`;
                this.renderCell(context, realx, realy, cell.block.asset, id, cell.block.scale);
            }
        }
    }

    /** Renders the given asset onto the given cell */
    private renderCell(context: CanvasRenderingContext2D, x: number, y: number, asset: string, id: string, scale?: number): void {
        if(scale === undefined) scale = 1;

        const renderoffset = ((1 - scale) / 2);
        x = x + renderoffset;
        y = y + renderoffset;

        const model = this.assetManager.getAssetRender(asset, id, (this.cellsize) * scale);
        if(model === null) return;

        context.drawImage(
            model,
            x * this.cellsize,
            y * this.cellsize,
        );
    }

    /** Returns the first cell object for the given player position */
    private getFirstRenderCell(me: any, rendercell: Vector2D): FirstRenderCell {
        return {
            x: rendercell[0] - CELLS_HORIZONTAL / 2,
            y: rendercell[1] - CELLS_VERTICAL / 2,
            renderx: -CELLS_HORIZONTAL / 2 * this.cellsize - (this.fixCoord(me.x) - rendercell[0] * this.cellsize),
            rendery: -CELLS_VERTICAL / 2 * this.cellsize - (this.fixCoord(me.y) - rendercell[1] * this.cellsize),
        };
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
        const model = entity.hit ? this.assetManager.getAssetRender(entity.asset, entity.id, this.cellsize * scale, HIT_COLOR) : this.assetManager.getAssetRender(entity.asset, entity.id, this.cellsize * scale);

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
        const model = player.hit ? this.assetManager.getAssetRender(player.asset, player.id, this.cellsize * scale, combineColors(player.color, HIT_COLOR)) : this.assetManager.getAssetRender(player.asset, player.id, this.cellsize * scale, player.color);

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
        const { x, y, scale, swingdir } = entity;
        const canvasX = this.canvas.width / 2 + this.fixCoord(x + Math.sin(swingdir) * ATTACK_HITBOX_OFFSET) - this.fixCoord(me.x);
        const canvasY = this.canvas.height / 2 + this.fixCoord(y + Math.cos(swingdir) * ATTACK_HITBOX_OFFSET) - this.fixCoord(me.y);
        this.context.save();
        this.context.translate(canvasX, canvasY);

        // draw swing
        this.context.beginPath();
        this.context.arc(0, 0, this.cellsize * scale / 2, 0, 2 * Math.PI);
        this.context.fillStyle = "white";
        this.context.fill();
        this.context.restore();
    }

    /** Renders the given player's username upper them */
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
    private renderDarkness(percent: number, firstcell: FirstRenderCell){
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
                const cell = this.playerclient.world.getCell(firstcell.x + dx, firstcell.y + dy);
                if(!cell.block) continue;
                if(!(cell.block as any).light) continue;

                const x = firstcell.renderx + (dx + .5) * this.cellsize;
                const y = firstcell.rendery + (dy + .5) * this.cellsize;
                const radius = (cell.block as any).light * this.cellsize;

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
    private renderBackground(me: any, firstcell: FirstRenderCell): void {
        // check if need to render background
        let renderbg = false;
        for(let dx = 0; dx < CELLS_HORIZONTAL; dx++){
            if(renderbg) break;

            for(let dy = 0; dy < CELLS_VERTICAL; dy++){
                const cell = this.playerclient.world.getCell(firstcell.x + dx, firstcell.y + dy);
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

        const model = this.assetManager.getAssetRender(ASSETS.SPACE_BG, "bg", scale, undefined, true);
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

/** The data format for the first render cell */
type FirstRenderCell = {
    x: number;
    y: number;
    renderx: number;
    rendery: number;
};

export default Renderer;
