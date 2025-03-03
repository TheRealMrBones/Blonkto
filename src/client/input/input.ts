import { updateInputs, click, interact, drop } from "../networking/networking.js";
import { getCellSize } from "../render/render.js";
import { blockCollisions, playerCollisions } from "../networking/collisions.js";
import { updateCoords } from "../render/ui.js";
import { getCurrentState } from "../networking/state.js";
import { Pos } from "../../shared/types.js";

import SharedConfig from "../../configs/shared.js";
const { PLAYER_SCALE, PLAYER_SPEED } = SharedConfig.PLAYER;

import ClientConfig from "../../configs/client.js";
const { CLIENT_UPDATE_RATE } = ClientConfig.UPDATE;

// #region init

const canvas = document.getElementById("gamecanvas")!;

let dir = 0;
let x = 0;
let y = 0;
let dx = 0;
let dy = 0;
let scale = PLAYER_SCALE;

let startw: number | null = null;
let starta: number | null = null;
let starts: number | null = null;
let startd: number | null = null;
let interval: NodeJS.Timeout | null = null;

let hotbarslot = 0;

let hit = false;
let swinging = false;
let lastattackdir = 0;

let falling = false;

// #endregion

// #region handle mouse movement

/** Response to mouse input from client */
function onMouseInput(e: MouseEvent): void {
    handleDirection(e.clientX, e.clientY);
}

/** Response to touch input from client */
function onTouchInput(e: TouchEvent): void {
    const touch = e.touches[0];
    handleDirection(touch.clientX, touch.clientY);
}

/** Sets the client direction based on mouse/touch screen position */
function handleDirection(x: number, y: number): void {
    dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
}

// #endregion

// #region handle keys

/** Response to key down input from client */
function handlekeyDown(e: KeyboardEvent): void {
    switch(e.key){
        // movement
        case "ArrowUp":
        case "w":
        case "W": {
            if(!startw) startw = Date.now();
            break;
        }
        case "ArrowDown":
        case "s":
        case "S": {
            if(!starts) starts = Date.now();
            break;
        }
        case "ArrowLeft":
        case "a":
        case "A": {
            if(!starta) starta = Date.now();
            break;
        }
        case "ArrowRight":
        case "d":
        case "D": {
            if(!startd) startd = Date.now();
            break;
        }

        // actions
        case "q": {
            drop({
                slot: hotbarslot,
                all: e.ctrlKey,
            });
            break;
        }

        // hotbar
        case "1": {
            sethotbarslot(0);
            break;
        }
        case "2": {
            sethotbarslot(1);
            break;
        }
        case "3": {
            sethotbarslot(2);
            break;
        }
        case "4": {
            sethotbarslot(3);
            break;
        }
        case "5": {
            sethotbarslot(4);
            break;
        }
        case "6": {
            sethotbarslot(5);
            break;
        }
        case "7": {
            sethotbarslot(6);
            break;
        }
        case "8": {
            sethotbarslot(7);
            break;
        }
        case "9": {
            sethotbarslot(8);
            break;
        }
    }
}

/** Response to key up input from client */
function handlekeyUp(e: KeyboardEvent): void {
    switch(e.key){
        case "ArrowUp":
        case "w":
        case "W": {
            if(startw){
                dy -= (Date.now() - startw) * PLAYER_SPEED / 1000;
                startw = null;
            }
            break;
        }
        case "ArrowDown":
        case "s":
        case "S": {
            if(starts){
                dy += (Date.now() - starts) * PLAYER_SPEED / 1000;
                starts = null;
            }
            break;
        }
        case "ArrowLeft":
        case "a":
        case "A": {
            if(starta){
                dx -= (Date.now() - starta) * PLAYER_SPEED / 1000;
                starta = null;
            }
            break;
        }
        case "ArrowRight":
        case "d":
        case "D": {
            if(startd){
                dx += (Date.now() - startd) * PLAYER_SPEED / 1000;
                startd = null;
            }
            break;
        }
    }
}

// #endregion

// #region handle mouse clicks

/** Response to mouse click input from client */
function handleMouseDown(e: MouseEvent): void {
    // get position of click compared to current player pos
    const clickpos = {
        xoffset: (e.clientX - window.innerWidth / 2) / getCellSize(),
        yoffset: (e.clientY - window.innerHeight / 2) / getCellSize(),
        mex: x,
        mey: y,
    };

    // send appropriate click event
    if(e.button == 0){
        click(clickpos);
    }else if(e.button == 2){
        interact(clickpos);
    }
}

// #endregion

// #region hotbar

/** Selects the given hotbar slot as in use */
export function sethotbarslot(index: number): void {
    const oldslot = document.getElementById("hotbarslot" + (hotbarslot + 1))!;
    const newslot = document.getElementById("hotbarslot" + (index + 1))!;
    oldslot.classList.remove("hotbarslotselected");
    newslot.classList.add("hotbarslotselected");

    hotbarslot = index;
}

// #endregion

// #region main handling

/** Updates the clients data based on most recent inputs */
function handleInput(): void {
    updatePos();

    updateInputs({
        t: Date.now(),
        dir: dir,
        dx: dx,
        dy: dy,
        hotbarslot: hotbarslot,
    });

    x = x + dx;
    y = y + dy;
    dx = 0;
    dy = 0;
}

/** Resets the input reading variables */
function resetMovement(): void {
    updatePos();
    startw = null;
    starta = null;
    starts = null;
    startd = null;
}

/** Updates the current position of the client based on most recent movement inputs */
function updatePos(): void {
    // update local position vars
    if(startw){
        dy -= (Date.now() - startw) * PLAYER_SPEED / 1000;
        startw = Date.now();
    }
    if(starts){
        dy += (Date.now() - starts) * PLAYER_SPEED / 1000;
        starts = Date.now();
    }
    if(starta){
        dx -= (Date.now() - starta) * PLAYER_SPEED / 1000;
        starta = Date.now();
    }
    if(startd){
        dx += (Date.now() - startd) * PLAYER_SPEED / 1000;
        startd = Date.now();
    }

    // update ui
    updateCoords(x + dx, y + dy);
    
    // collisions
    const others = getCurrentState().others!;
    const self = {
        x: x + dx,
        y: y + dy,
        scale: scale,
    };
    
    //playerCollisions(self, others);
    blockCollisions(self);
}

// #endregion

// #region start and stop capturing

/** Starts capturing client inputs for gameplay and sets interval to send input updates to the server */
export function startCapturingInput(xp: number, yp: number): void {
    // set spawn position
    x = xp;
    y = yp;
    dx = 0;
    dy = 0;

    // add input listeners
    window.addEventListener("mousemove", onMouseInput);
    window.addEventListener("click", onMouseInput);
    window.addEventListener("touchstart", onTouchInput);
    window.addEventListener("touchmove", onTouchInput);
    window.addEventListener("keydown", handlekeyDown);
    window.addEventListener("keyup", handlekeyUp);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("blur", resetMovement);

    // set client side update interval
    interval = setInterval(handleInput, 1000 / CLIENT_UPDATE_RATE);
}

/** Stops capturing client inputs for gameplay and pauses sending input updates to the server */
export function stopCapturingInput(): void {
    // remove input listeners
    window.removeEventListener("mousemove", onMouseInput);
    window.removeEventListener("click", onMouseInput);
    window.removeEventListener("touchstart", onTouchInput);
    window.removeEventListener("touchmove", onTouchInput);
    window.removeEventListener("keydown", handlekeyDown);
    window.removeEventListener("keyup", handlekeyUp);
    canvas.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("blur", resetMovement);
    
    // reset variables
    dir = 0;
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    startw = null;
    starta = null;
    starts = null;
    startd = null;

    // clear client side update interval
    if(interval !== null) clearInterval(interval);
}

/** Stops capturing client inputs for gameplay but continues sending input updates to the server */
export function pauseCapturingInputs(): void {
    // pause input listeners
    window.removeEventListener("mousemove", onMouseInput);
    window.removeEventListener("click", onMouseInput);
    window.removeEventListener("touchstart", onTouchInput);
    window.removeEventListener("touchmove", onTouchInput);
    window.removeEventListener("keydown", handlekeyDown);
    window.removeEventListener("keyup", handlekeyUp);
    canvas.removeEventListener("mousedown", handleMouseDown);
    
    // do final position update then remove current movements
    updatePos();
    startw = null;
    starta = null;
    starts = null;
    startd = null;
}

/** Resumes paused client input capturing */
export function resumeCapturingInputs(): void {
    // resume input listeners
    window.addEventListener("mousemove", onMouseInput);
    window.addEventListener("click", onMouseInput);
    window.addEventListener("touchstart", onTouchInput);
    window.addEventListener("touchmove", onTouchInput);
    window.addEventListener("keydown", handlekeyDown);
    window.addEventListener("keyup", handlekeyUp);
    canvas.addEventListener("mousedown", handleMouseDown);
}

// #endregion

// #region getters

/** Returns all relevant information on the clients current state */
export function getSelf(): any {
    updatePos();

    return {
        dir: dir,
        x: x + dx,
        y: y + dy,
        scale: scale,
        hotbarslot: hotbarslot,
        hit: hit,
        swinging: swinging,
        lastattackdir: lastattackdir,
        falling: falling,
    };
}

// #endregion

// #region setters

/** Pushes the players position the given amounts as determined by the client */
export function clientPush(pushx: number, pushy: number): void {
    dx += pushx;
    dy += pushy;
}

/** Pushes the players position the given amounts as determined by the server */
export function serverPush(pushx: number, pushy: number): void {
    x += pushx;
    y += pushy;
}

/** Sets the players position to the given spot */
export function setPos(newpos: Pos): void {
    // keep current inputs running but don't include previous time held
    if(startw) startw = Date.now();
    if(starts) starts = Date.now();
    if(starta) starta = Date.now();
    if(startd) startd = Date.now();

    // set new position
    x = newpos.x;
    y = newpos.y;
    dx = 0;
    dx = 0;
}

/** Sets the players misc state data to the given values */
export function setSelf(me: any): void {
    scale = me.scale;
    hit = me.hit;
    swinging = me.swinging;
    lastattackdir = me.lastattackdir;
    falling = me.falling;
}

// #endregion