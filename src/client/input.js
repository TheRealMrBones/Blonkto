import { updateInputs, click, interact } from './networking.js';
import { getCellSize } from './render.js';
import { blockCollisions, playerCollisions } from './collisions.js';
import { updateCoords } from './ui.js';
import { getCurrentState } from './state.js';

const Constants = require('../shared/constants.js');

let dir = 0;
let x = 0;
let y = 0;
let startw = null;
let starta = null;
let starts = null;
let startd = null;
let interval = null;

function onMouseInput(e){
    handleDirection(e.clientX, e.clientY);
}

function onTouchInput(e){
    const touch = e.touches[0];
    handleDirection(touch.clientX, touch.clientY);
}

function handleDirection(x, y){
    dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
}

function handlekeyDown(e){
    switch(e.key){
        case 'ArrowUp':
        case 'w':
        case 'W': {
            if(!startw){
                startw = Date.now();
            }
            break;
        }
        case 'ArrowDown':
        case 's':
        case 'S': {
            if(!starts){
                starts = Date.now();
            }
            break;
        }
        case 'ArrowLeft':
        case 'a':
        case 'A': {
            if(!starta){
                starta = Date.now();
            }
            break;
        }
        case 'ArrowRight':
        case 'd':
        case 'D': {
            if(!startd){
                startd = Date.now();
            }
            break;
        }
    }
}

function handlekeyUp(e){
    switch(e.key){
        case 'ArrowUp':
        case 'w':
        case 'W': {
            if(startw){
                y -= (Date.now() - startw) * Constants.PLAYER_SPEED / 1000;
                startw = null;
            }
            break;
        }
        case 'ArrowDown':
        case 's':
        case 'S': {
            if(starts){
                y += (Date.now() - starts) * Constants.PLAYER_SPEED / 1000;
                starts = null;
            }
            break;
        }
        case 'ArrowLeft':
        case 'a':
        case 'A': {
            if(starta){
                x -= (Date.now() - starta) * Constants.PLAYER_SPEED / 1000;
                starta = null;
            }
            break;
        }
        case 'ArrowRight':
        case 'd':
        case 'D': {
            if(startd){
                x += (Date.now() - startd) * Constants.PLAYER_SPEED / 1000;
                startd = null;
            }
            break;
        }
    }
}

function handleMouseDown(e){
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

function handleInput(){
    updatePos();

    updateInputs({
        t: Date.now(),
        dir: dir,
        x: x,
        y: y,
    });
}

window.addEventListener('blur', function() {
    updatePos();
    startw = null;
    starta = null;
    starts = null;
    startd = null;
});

function updatePos(){
    // update local position vars
    if(startw){
        y -= (Date.now() - startw) * Constants.PLAYER_SPEED / 1000;
        startw = Date.now();
    }
    if(starts){
        y += (Date.now() - starts) * Constants.PLAYER_SPEED / 1000;
        starts = Date.now();
    }
    if(starta){
        x -= (Date.now() - starta) * Constants.PLAYER_SPEED / 1000;
        starta = Date.now();
    }
    if(startd){
        x += (Date.now() - startd) * Constants.PLAYER_SPEED / 1000;
        startd = Date.now();
    }

    // update ui
    updateCoords(x, y);
    
    // collisions
    const others = getCurrentState().others;
    playerCollisions({
        dir: dir,
        x: x,
        y: y,
    }, others);
    blockCollisions({ x: x, y: y });
}

export function startCapturingInput(xp, yp){
    // set spawn position
    x = xp;
    y = yp;

    // add input listeners
    window.addEventListener('mousemove', onMouseInput);
    window.addEventListener('click', onMouseInput);
    window.addEventListener('touchstart', onTouchInput);
    window.addEventListener('touchmove', onTouchInput);
    window.addEventListener('keydown', handlekeyDown);
    window.addEventListener('keyup', handlekeyUp);
    window.addEventListener('mousedown', handleMouseDown);

    // set client side update interval
    interval = setInterval(handleInput, 1000 / Constants.CLIENT_UPDATE_RATE);
}

export function stopCapturingInput(){
    // remove input listeners
    window.removeEventListener('mousemove', onMouseInput);
    window.removeEventListener('click', onMouseInput);
    window.removeEventListener('touchstart', onTouchInput);
    window.removeEventListener('touchmove', onTouchInput);
    window.removeEventListener('keydown', handlekeyDown);
    window.removeEventListener('keyup', handlekeyUp);
    window.removeEventListener('mousedown', handleMouseDown);
    
    // reset variables
    dir = 0;
    x = 0;
    y = 0;
    startw = null;
    starta = null;
    starts = null;
    startd = null;

    // clear client side update interval
    clearInterval(interval)
}

export function pauseCapturingInputs(){
    // pause input listeners
    window.removeEventListener('mousemove', onMouseInput);
    window.removeEventListener('click', onMouseInput);
    window.removeEventListener('touchstart', onTouchInput);
    window.removeEventListener('touchmove', onTouchInput);
    window.removeEventListener('keydown', handlekeyDown);
    window.removeEventListener('keyup', handlekeyUp);
    window.removeEventListener('mousedown', handleMouseDown);
    
    // do final position update then remove current movements
    updatePos();
    startw = null;
    starta = null;
    starts = null;
    startd = null;
}

export function resumeCapturingInputs(){
    // resume input listeners
    window.addEventListener('mousemove', onMouseInput);
    window.addEventListener('click', onMouseInput);
    window.addEventListener('touchstart', onTouchInput);
    window.addEventListener('touchmove', onTouchInput);
    window.addEventListener('keydown', handlekeyDown);
    window.addEventListener('keyup', handlekeyUp);
    window.addEventListener('mousedown', handleMouseDown);
}

export function getSelf(){
    updatePos();

    return {
        dir: dir,
        x: x,
        y: y,
    }
}

export function push(pushx, pushy){
    x += pushx;
    y += pushy;
}

export function setPos(newpos){
    // keep current inputs running but don't include previous time held
    if(startw){
        startw = Date.now();
    }
    if(starts){
        starts = Date.now();
    }
    if(starta){
        starta = Date.now();
    }
    if(startd){
        startd = Date.now();
    }

    // set new position
    x = newpos.x;
    y = newpos.y;
}