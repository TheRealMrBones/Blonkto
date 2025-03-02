import { chat } from "../networking/networking.js";
import { pauseCapturingInputs, resumeCapturingInputs, sethotbarslot } from "../input/input.js";
import { toggleAllChatShow } from "./chat.js";

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

let focusingOut = false;

let ignorechatenter = 0;

// #endregion

// #region persistent listeners

for(let i = 0; i < 9; i++){
    const hotbarslot = document.getElementById("hotbarslot" + (i + 1))!;
    hotbarslot.addEventListener("click", function() {
        sethotbarslot(i);
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
    if(SHOW_TAB) tabdiv.style.display = "block";

    // add event listeners
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
    if(SHOW_TAB) tabdiv.style.display = "none";

    // remove event listeners
    window.removeEventListener("keyup", keyUpChecks);
    chatInput.removeEventListener("keyup", chatInputKeyUp);
    chatInput.removeEventListener("focusin", chatInputFocus);
    chatInput.removeEventListener("focusout", chatInputUnfocus);
}

// #endregion

// #region event functions

/** Handles UI related keyboard events */
function keyUpChecks(event: KeyboardEvent): void {
    event.preventDefault();
    switch(event.key){
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
    }
}

/** Handles chat UI related keyboard events */
function chatInputKeyUp(event: KeyboardEvent): void {
    event.preventDefault();
    if(event.key === "Enter"){
        chat({
            text: chatInput.value,
        });
        focusingOut = true;
        chatInput.value = "";
        chatInput.blur();
        toggleAllChatShow(false);
    }
}

/** Handles chat UI related focus events */
function chatInputFocus(event: FocusEvent): void {
    pauseCapturingInputs();
    window.removeEventListener("keyup", keyUpChecks);
    toggleAllChatShow(true);
}

/** Handles chat UI related unfocus events */
function chatInputUnfocus(event: FocusEvent): void {
    resumeCapturingInputs();
    window.addEventListener("keyup", keyUpChecks);
    toggleAllChatShow(false);
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