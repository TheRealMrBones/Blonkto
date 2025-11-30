import PlayerClient from "client/playerClient.js";
import ClientConfig from "configs/client.js";
import SharedConfig from "configs/shared.js";
import Constants from "shared/constants.js";
import { DropContent, ClickContent, InputContent } from "shared/messageContentTypes.js";
import Circle from "shared/physics/circle.js";
import CollisionObject from "shared/physics/collisionObject.js";
import { Vector2D } from "shared/types.js";

const { GAME_MODES } = Constants;
const { PLAYER_SCALE, PLAYER_SPEED } = SharedConfig.PLAYER;
const { CLIENT_UPDATE_RATE } = ClientConfig.UPDATE;

type InputListener = {
    event: string;
    callback: EventListenerOrEventListenerObject;
};

/** Manages all input listeners and events on the client */
class InputManager {
    private readonly playerclient: PlayerClient;
    private readonly canvas = document.getElementById("gamecanvas")!;
    private readonly listeners: InputListener[] = [];
    private readonly canvaslisteners: InputListener[] = []; // temp while UI is still in actual html

    private lastupdate = null as number | null;

    private dir = 0;
    private x = 0;
    private y = 0;
    private dx = 0;
    private dy = 0;
    private scale = PLAYER_SCALE;

    private startw: number | null = null;
    private starta: number | null = null;
    private starts: number | null = null;
    private startd: number | null = null;
    private interval: NodeJS.Timeout | null = null;

    private mousex: number = 0;
    private mousey: number = 0;

    private selectedslot = 0;
    private hotbarslot = 0;
    private hotbarpaused = false;

    private hit = false;
    private swinging = false;
    private swingdir = 0;

    private falling = false;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;

        // register default listeners
        this.registerListener("mousemove", this.onMouseInput as EventListener);
        this.registerListener("keydown", this.handlekeyDown as EventListener);
        this.registerListener("keyup", this.handlekeyUp as EventListener);
        this.registerListener("mousedown", this.handleMouseDown as EventListener);
        this.registerListener("blur", this.resetMovement as EventListener);
    }

    // #region listener management

    /** Registers the given listener to the given event so that when it happens during the game loop it is called */
    registerListener(event: string, callback: EventListener): void {
        if(event.includes("mouse") || event.includes("click") || event.includes("touch")){
            this.canvaslisteners.push({
                event: event,
                callback: callback.bind(this)
            });
        }else{
            this.listeners.push({
                event: event,
                callback: callback.bind(this)
            });
        }
    }

    /** Toggles all game loop listeners on or off */
    toggleListeners(toggle: boolean): void {
        if(toggle){
            this.listeners.forEach(l => window.addEventListener(l.event, l.callback));
            this.canvaslisteners.forEach(l => this.canvas.addEventListener(l.event, l.callback));
        }else{
            this.listeners.forEach(l => window.removeEventListener(l.event, l.callback));
            this.canvaslisteners.forEach(l => this.canvas.removeEventListener(l.event, l.callback));
        }
    }

    // #endregion

    // #region mouse

    /** Response to mouse input from client */
    private onMouseInput(e: MouseEvent): void {
        this.mousex = e.clientX;
        this.mousey = e.clientY;

        this.dir = Math.atan2(this.mousex - window.innerWidth / 2, window.innerHeight / 2 - this.mousey);
    }

    // #endregion

    // #region handle keys

    /** Response to key down input from client */
    private handlekeyDown(e: KeyboardEvent): void {
        switch(e.key){
            // movement
            case "ArrowUp":
            case "w":
            case "W": {
                if(!this.startw) this.startw = Date.now();
                break;
            }
            case "ArrowDown":
            case "s":
            case "S": {
                if(!this.starts) this.starts = Date.now();
                break;
            }
            case "ArrowLeft":
            case "a":
            case "A": {
                if(!this.starta) this.starta = Date.now();
                break;
            }
            case "ArrowRight":
            case "d":
            case "D": {
                if(!this.startd) this.startd = Date.now();
                break;
            }

            // actions
            case "q": {
                const content: DropContent = {
                    slot: this.selectedslot,
                    all: e.ctrlKey,
                };
                this.playerclient.networkingManager.drop(content);
                break;
            }
            case "f": {
                const content: ClickContent = {
                    xoffset: (this.mousex - window.innerWidth / 2) / this.playerclient.renderer.getCellSize(),
                    yoffset: (this.mousey - window.innerHeight / 2) / this.playerclient.renderer.getCellSize(),
                    mex: this.x,
                    mey: this.y,
                };

                this.playerclient.networkingManager.interact(content);
            }
        }

        // hotbar
        const posnum = parseInt(e.key);
        if(!Number.isNaN(posnum) && posnum != 0) this.selectSlot(posnum - 1);
    }

    /** Response to key up input from client */
    private handlekeyUp(e: KeyboardEvent): void {
        switch(e.key){
            case "ArrowUp":
            case "w":
            case "W": {
                if(this.startw){
                    this.dy -= (Date.now() - this.startw) * PLAYER_SPEED / 1000;
                    this.startw = null;
                }
                break;
            }
            case "ArrowDown":
            case "s":
            case "S": {
                if(this.starts){
                    this.dy += (Date.now() - this.starts) * PLAYER_SPEED / 1000;
                    this.starts = null;
                }
                break;
            }
            case "ArrowLeft":
            case "a":
            case "A": {
                if(this.starta){
                    this.dx -= (Date.now() - this.starta) * PLAYER_SPEED / 1000;
                    this.starta = null;
                }
                break;
            }
            case "ArrowRight":
            case "d":
            case "D": {
                if(this.startd){
                    this.dx += (Date.now() - this.startd) * PLAYER_SPEED / 1000;
                    this.startd = null;
                }
                break;
            }
        }
    }

    // #endregion

    // #region handle mouse clicks

    /** Response to mouse click input from client */
    private handleMouseDown(e: MouseEvent): void {
        // get position of click compared to current player pos
        const content: ClickContent = {
            xoffset: (e.clientX - window.innerWidth / 2) / this.playerclient.renderer.getCellSize(),
            yoffset: (e.clientY - window.innerHeight / 2) / this.playerclient.renderer.getCellSize(),
            mex: this.x,
            mey: this.y,
        };

        // send appropriate click event
        if(e.button == 0){
            this.playerclient.networkingManager.click(content);
        }else if(e.button == 2){
            this.playerclient.networkingManager.interact(content);
        }
    }

    // #endregion

    // #region hotbar

    /** Selects the given hotbar slot as in use */
    selectSlot(index: number): void {
        const oldslot = document.getElementById("slot" + (this.selectedslot + 1))!;
        const newslot = document.getElementById("slot" + (index + 1))!;
        oldslot.classList.remove("slotselected");
        newslot.classList.add("slotselected");

        this.selectedslot = index;
        if(index < 9 && !this.hotbarpaused) this.hotbarslot = index;
    }

    /** Returns the slot number than is currently selected */
    getSelectedSlot(): number {
        return this.selectedslot;
    }

    /** Pauses the hotbar selection functionality */
    pauseHotbar(): void {
        this.hotbarpaused = true;
    }

    /** Unpauses the hotbar selection functionality */
    unpauseHotbar(): void {
        this.hotbarpaused = false;
        this.selectSlot(this.hotbarslot);
    }

    // #endregion

    // #region main handling

    /** Updates the clients data based on most recent inputs */
    private handleInput(): void {
        const t = Date.now();
        const dt = this.lastupdate === null ? 1000 / CLIENT_UPDATE_RATE : t - this.lastupdate;
        this.updatePos(t);

        const maxmovedist = PLAYER_SPEED * dt / 1000;
        this.dx = Math.min(this.dx, maxmovedist);
        this.dy = Math.min(this.dy, maxmovedist);

        const content: InputContent = {
            t: t,
            lastupdatetime: this.lastupdate,
            dir: this.dir,
            dx: this.dx,
            dy: this.dy,
            hotbarslot: this.selectedslot,
            lastserverupdate: this.playerclient.stateManager.getLastServerUpdate(),
            closestation: this.playerclient.inventory.isStationClosing(),
        };
        this.playerclient.networkingManager.updateInputs(content);
        this.lastupdate = t;

        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
        this.dx = 0;
        this.dy = 0;
    }

    /** Resets the input reading variables */
    private resetMovement(): void {
        this.updatePos();
        this.startw = null;
        this.starta = null;
        this.starts = null;
        this.startd = null;
    }

    /** Updates the current position of the client based on most recent movement inputs */
    private updatePos(time?: number): void {
        // get time
        const t = time === undefined ? Date.now() : time;

        // update local position vars
        if(this.startw){
            this.dy -= (t - this.startw) * PLAYER_SPEED / 1000;
            this.startw = t;
        }
        if(this.starts){
            this.dy += (t - this.starts) * PLAYER_SPEED / 1000;
            this.starts = t;
        }
        if(this.starta){
            this.dx -= (t - this.starta) * PLAYER_SPEED / 1000;
            this.starta = t;
        }
        if(this.startd){
            this.dx += (t - this.startd) * PLAYER_SPEED / 1000;
            this.startd = t;
        }

        // collisions
        if(!this.falling && this.playerclient.getGamemode() != GAME_MODES.SPECTATOR){
            this.playerclient.collisionManager.blockCollisions();
        }

        // update ui
        this.playerclient.renderer.uiManager.infoui.updateCoords(this.x + this.dx, this.y + this.dy);
    }

    // #endregion

    // #region start and stop capturing

    /** Starts capturing client inputs for gameplay and sets interval to send input updates to the server */
    startCapturingInput(xp: number, yp: number): void {
        // set spawn position
        this.x = xp;
        this.y = yp;
        this.dx = 0;
        this.dy = 0;

        // add input listeners
        this.toggleListeners(true);

        // set client side update interval
        this.interval = setInterval(this.handleInput.bind(this), 1000 / CLIENT_UPDATE_RATE);
    }

    /** Stops capturing client inputs for gameplay and pauses sending input updates to the server */
    stopCapturingInput(): void {
        // remove input listeners
        this.toggleListeners(false);

        // reset variables
        this.dir = 0;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.startw = null;
        this.starta = null;
        this.starts = null;
        this.startd = null;

        // clear client side update interval
        if(this.interval !== null) clearInterval(this.interval);
    }

    /** Stops capturing client inputs for gameplay but continues sending input updates to the server */
    pauseCapturingInputs(): void {
        // pause input listeners
        this.toggleListeners(false);

        // do final position update then remove current movements
        this.updatePos();
        this.startw = null;
        this.starta = null;
        this.starts = null;
        this.startd = null;
    }

    /** Resumes paused client input capturing */
    resumeCapturingInputs(): void {
        // resume input listeners
        this.toggleListeners(true);
    }

    // #endregion

    // #region getters

    /** Returns all relevant information on the clients current state */
    getSelf(): any {
        this.updatePos();

        return {
            dir: this.dir,
            x: this.x + this.dx,
            y: this.y + this.dy,
            scale: this.scale,
            hotbarslot: this.selectedslot,
            hit: this.hit,
            swinging: this.swinging,
            swingdir: this.swingdir,
            falling: this.falling,
        };
    }

    /** Returns the player as a collision object */
    getSelfAsCollisionObject(): CollisionObject {
        return new Circle([this.x + this.dx, this.y + this.dy], this.scale / 2);
    }

    /** Returns the coordinates of the tiles that the player is on */
    tilesOn(strict?: boolean): Vector2D[] {
        const points = [];
        const posoffset = strict ? 0 : (this.scale / 2) - .01; // offset so barely touching tiles are not counted

        // get all integer coordinate points that are within object
        for(let x = Math.floor(this.x + this.dx - posoffset); x < this.x + this.dx + posoffset; x++){
            for(let y = Math.floor(this.y + this.dy - posoffset); y < this.y + this.dy + posoffset; y++){
                const dist = Math.sqrt(Math.pow(this.x + this.dx - x, 2) + Math.pow(this.y + this.dy - y, 2));
                if(dist <= posoffset) points.push([x, y]);
            }
        }

        // start tile array
        const tiles: Vector2D[] = [[Math.floor(this.x + this.dx), Math.floor(this.y + this.dy)]]; // include known center tile

        // include tiles hit by each main axis end of the object
        if(Math.floor(this.x + this.dx - posoffset) != Math.floor(this.x + this.dx)){
            tiles.push([Math.floor(this.x + this.dx - posoffset), Math.floor(this.y + this.dy)]);
        }
        if(Math.floor(this.x + this.dx + posoffset) != Math.floor(this.x + this.dx)){
            tiles.push([Math.floor(this.x + this.dx + posoffset), Math.floor(this.y + this.dy)]);
        }
        if(Math.floor(this.y + this.dy - posoffset) != Math.floor(this.y + this.dy)){
            tiles.push([Math.floor(this.x + this.dx), Math.floor(this.y + this.dy - posoffset)]);
        }
        if(Math.floor(this.y + this.dy + posoffset) != Math.floor(this.y + this.dy)){
            tiles.push([Math.floor(this.x + this.dx), Math.floor(this.y + this.dy + posoffset)]);
        }

        // get a list of the corresponding points that the points are touching
        points.forEach(p => {
            const tilestoadd: Vector2D[] = [
                [p[0], p[1]],
                [p[0] - 1, p[1]],
                [p[0] - 1, p[1] - 1],
                [p[0], p[1] - 1],
            ];

            tilestoadd.forEach(t => {
                if(!tiles.some(ct => ct[0] == t[0] && ct[1] == t[1])) tiles.push(t);
            });
        });

        return tiles;
    }

    // #endregion

    // #region setters

    /** Pushes the players position the given amounts as determined by the client */
    clientPush(pushx: number, pushy: number): void {
        this.dx += pushx;
        this.dy += pushy;
    }

    /** Pushes the players position the given amounts as determined by the server */
    serverPush(pushx: number, pushy: number): void {
        this.x += pushx;
        this.y += pushy;
    }

    /** Sets the players position to the given spot */
    setPos(newpos: Vector2D): void {
        // keep current inputs running but don't include previous time held
        if(this.startw) this.startw = Date.now();
        if(this.starts) this.starts = Date.now();
        if(this.starta) this.starta = Date.now();
        if(this.startd) this.startd = Date.now();

        // set new position
        this.x = newpos[0];
        this.y = newpos[1];
        this.dx = 0;
        this.dx = 0;
    }

    /** Sets the players misc state data to the given values */
    setSelf(me: any): void {
        this.scale = me.scale;
        this.hit = me.hit;
        this.swinging = me.swinging;
        this.swingdir = me.swingdir;
        this.falling = me.falling;
    }

    /** Ignores / Reverts the latest movement inputs not sent to the server yet */
    ignoreDeltas(){
        this.dx = 0;
        this.dy = 0;
        this.startw = null;
        this.starta = null;
        this.starts = null;
        this.startd = null;
    }

    // #endregion
}

export default InputManager;
