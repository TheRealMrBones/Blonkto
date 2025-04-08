import { chat, drop } from "../networking/networking.js";
import { getSelectedSlot, pauseCapturingInputs, pauseHotbar, resumeCapturingInputs, selectSlot, unpauseHotbar } from "../input/input.js";
import { toggleAllChatShow } from "./chat.js";
import { swapSlots } from "../inventory/inventory.js";
import { DropContent, SendMessageContent } from "../../shared/messageContentTypes.js";

import SharedConfig from "../../configs/shared.js";
const { SHOW_TAB, KILLS_TAB } = SharedConfig.TAB;

// #region init

const chatDiv = document.getElementById("chat")!;
const chatInput = document.getElementById("chatinput") as HTMLInputElement;
const infodiv = document.getElementById("info")!;
const healthtext = document.getElementById("healthtext")!;
const coordstext = document.getElementById("coordstext")!;
const killstext = document.getElementById("killstext")!;
const fpstext = document.getElementById("fpstext")!;
const pingtext = document.getElementById("pingtext")!;
const connectionlostdiv = document.getElementById("connectionlost")!;
const tabdiv = document.getElementById("tab")!;
const hotbardiv = document.getElementById("hotbar")!;
const inventorydiv = document.getElementById("inventory")!;

let focusingOut = false;
let inventoryopen = false;

let ignorechatenter = 0;

// #endregion

// #region persistent listeners

for(let i = 0; i < 36; i++){
    const hotbarslot = document.getElementById("slot" + (i + 1))!;
    hotbarslot.addEventListener("click", function() {
        selectSlot(i);
    });
}

// #endregion

// #region main functions

/** Prepares and shows the game UI */
export function setupUi(): void {
    // show ui
    chatDiv.style.display = "block";
    infodiv.style.display = "block";
    hotbardiv.style.display = "block";

    // add event listeners
    window.addEventListener("keydown", keyDownChecks);
    window.addEventListener("keyup", keyUpChecks);
    chatInput.addEventListener("keyup", chatInputKeyUp);
    chatInput.addEventListener("focusin", chatInputFocus);
    chatInput.addEventListener("focusout", chatInputUnfocus);

    // prepare ignorechatenter
    ignorechatenter = Date.now();
}

/** Hides the game UI */
export function hideUi(): void {
    // hide ui
    chatDiv.style.display = "none";
    infodiv.style.display = "none";
    hotbardiv.style.display = "none";
    inventorydiv.style.display = "none";
    inventoryopen = false;
    if(SHOW_TAB) tabdiv.style.display = "none";

    // remove event listeners
    window.removeEventListener("keydown", keyDownChecks);
    window.removeEventListener("keyup", keyUpChecks);
    chatInput.removeEventListener("keyup", chatInputKeyUp);
    chatInput.removeEventListener("focusin", chatInputFocus);
    chatInput.removeEventListener("focusout", chatInputUnfocus);
}

// #endregion

// #region event functions

/** Handles UI related key down events */
function keyDownChecks(event: KeyboardEvent): void {
    switch(event.key){
        case "Tab": {
            if(SHOW_TAB) tabdiv.style.display = "block";
            event.preventDefault();
            break;
        }
    }
}

/** Handles UI related key up events */
function keyUpChecks(event: KeyboardEvent): void {
    event.preventDefault();
    switch(event.key){
        case "e": {
            if(!inventoryopen){
                openInventory();
            }
            break;
        }
        case "Enter": {
            if(Date.now() - ignorechatenter < 500){
                // ignore open chat if enter was used to start the game
            }else if(focusingOut){
                focusingOut = !focusingOut;
            }else{
                chatInput.focus();
                toggleAllChatShow(true);
            }
            break;
        }
        case "/": {
            chatInput.focus();
            chatInput.value = "/";
            toggleAllChatShow(true);
            break;
        }
        case "Tab": {
            if(SHOW_TAB) tabdiv.style.display = "none";
            break;
        }
    }
}

/** Handles chat UI related keyboard events */
function chatInputKeyUp(event: KeyboardEvent): void {
    event.preventDefault();
    if(event.key === "Enter"){
        const content: SendMessageContent = {
            text: chatInput.value,
        };
        chat(content);
        focusingOut = true;
        chatInput.value = "";
        chatInput.blur();
        toggleAllChatShow(false);
    }
}

/** Handles chat UI related focus events */
function chatInputFocus(event: FocusEvent): void {
    if(inventoryopen) closeInventory();
    
    pauseCapturingInputs();
    window.removeEventListener("keydown", keyDownChecks);
    window.removeEventListener("keyup", keyUpChecks);
    toggleAllChatShow(true);
}

/** Handles chat UI related unfocus events */
function chatInputUnfocus(event: FocusEvent): void {
    resumeCapturingInputs();
    window.addEventListener("keydown", keyDownChecks);
    window.addEventListener("keyup", keyUpChecks);
    toggleAllChatShow(false);
}

/** Handles the open inventory action */
function openInventory(): void {
    inventoryopen = true;
    inventorydiv.style.display = "block";
    pauseCapturingInputs();
    window.removeEventListener("keydown", keyDownChecks);
    window.removeEventListener("keyup", keyUpChecks);
    window.addEventListener("keyup", keyUpChecksInventory);
    pauseHotbar();
}

/** Handles the close inventory action */
function closeInventory(): void {
    inventoryopen = false;
    inventorydiv.style.display = "none";
    resumeCapturingInputs();
    window.addEventListener("keydown", keyDownChecks);
    window.addEventListener("keyup", keyUpChecks);
    window.removeEventListener("keyup", keyUpChecksInventory);
    unpauseHotbar();
}

/** Handles keyboard inputs when in inventory */
function keyUpChecksInventory(event: KeyboardEvent): void {
    event.preventDefault();
    switch(event.key){
        case "e": {
            if(inventoryopen){
                closeInventory();
            }
            break;
        }
        case "q": {
            const content: DropContent = {
                slot: getSelectedSlot(),
                all: event.ctrlKey,
            };
            drop(content);
            break;
        }
        case "1": {
            swapSlots(getSelectedSlot(), 0);
            break;
        }
        case "2": {
            swapSlots(getSelectedSlot(), 1);
            break;
        }
        case "3": {
            swapSlots(getSelectedSlot(), 2);
            break;
        }
        case "4": {
            swapSlots(getSelectedSlot(), 3);
            break;
        }
        case "5": {
            swapSlots(getSelectedSlot(), 4);
            break;
        }
        case "6": {
            swapSlots(getSelectedSlot(), 5);
            break;
        }
        case "7": {
            swapSlots(getSelectedSlot(), 6);
            break;
        }
        case "8": {
            swapSlots(getSelectedSlot(), 7);
            break;
        }
        case "9": {
            swapSlots(getSelectedSlot(), 8);
            break;
        }
    }
}

// #endregion

// #region update ui

/** Updates the health UI to the given value */
export function updateHealth(health: number): void {
    healthtext.innerHTML = `Health: ${Math.round(health).toString()}`;
}

/** Updates the coordinates UI to the given position */
export function updateCoords(x: number, y: number): void {
    coordstext.innerHTML = `Coords: ${x.toFixed(1)}, ${y.toFixed(1)}`;
}

/** Updates the kills UI to the given value */
export function updateKills(kills: number): void {
    killstext.innerHTML = `Kills: ${kills.toString()}`;
}

/** Updates the FPS UI to the given value */
export function updateFps(fps: number): void {
    fpstext.innerHTML = `FPS: ${Math.round(fps).toString()}`;
}

/** Updates the ping UI to the given value */
export function updatePing(ping: number): void {
    pingtext.innerHTML = `Ping: ${Math.round(ping).toString()}`;
}

/** Toggles the connection lost icon to appear or disapear */
export function toggleConnectionLost(toggle: boolean): void {
    connectionlostdiv.style.display = toggle ? "block" : "none";
}

/** Updates the tab list with the given data */
export function updateTab(data: any[]): void {
    if(data.length == 0){
        tabdiv.innerHTML = "";
        return;
    };

    let newtext = getTabString(data[0]);
    for(let i = 1; i < data.length; i++){
        newtext += `<br>${getTabString(data[i])}`;
    }
    tabdiv.innerHTML = newtext;
}

/** Returns string representation of a player in tab with the given data */
function getTabString(playerdata: any): string {
    let text = playerdata.username;
    if(KILLS_TAB) text = playerdata.kills + " " + text;
    return text;
}

// #endregion