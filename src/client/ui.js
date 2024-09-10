import { chat } from './networking.js';
import { pauseCapturingInputs, resumeCapturingInputs } from './input.js';
import { toggleAllChatShow } from './chat.js';

const chatDiv = document.getElementById('chat');
const chatInput = document.getElementById('chatinput');
const coordsdiv = document.getElementById('coords');
const coordstext = document.getElementById('coordstext');
const connectionlostdiv = document.getElementById('connectionlost');

let focusingOut = false;

let ignorechatenter = 0;

// #region main functions

export function setupUi(){
    // show ui
    chatDiv.style.display = "block";
    coordsdiv.style.display = "block";

    // add event listeners
    window.addEventListener("keyup", keyUpChecks);
    chatInput.addEventListener("keyup", chatInputKeyUp);
    chatInput.addEventListener("focusin", chatInputFocus);
    chatInput.addEventListener("focusout", chatInputUnfocus);

    // prepare ignorechatenter
    ignorechatenter = Date.now();
}

export function hideUi(){
    // hide ui
    chatDiv.style.display = "none";
    coordsdiv.style.display = "none";

    // remove event listeners
    window.removeEventListener("keyup", keyUpChecks);
    chatInput.removeEventListener("keyup", chatInputKeyUp);
    chatInput.removeEventListener("focusin", chatInputFocus);
    chatInput.removeEventListener("focusout", chatInputUnfocus);
}

// #endregion

// #region event functions

function keyUpChecks(event){
    event.preventDefault();
    switch(event.key){
        case "Enter": {
            if(Date.now() - ignorechatenter > 1000){
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

function chatInputKeyUp(event){
    event.preventDefault();
    if(event.key === "Enter"){
        chat({
            text: chatInput.value,
        });
        focusingOut = true;
        chatInput.blur();
        toggleAllChatShow(false);
    }
}

function chatInputFocus(event){
    pauseCapturingInputs();
    window.removeEventListener("keyup", keyUpChecks);
    toggleAllChatShow(true);
}

function chatInputUnfocus(event){
    resumeCapturingInputs();
    chatInput.value = "";
    window.addEventListener("keyup", keyUpChecks);
    toggleAllChatShow(false);
}

// #endregion

// #region update ui

export function updateCoords(x, y){
    coordstext.innerHTML = `${x.toFixed(1)}, ${y.toFixed(1)}`;
}

export function toggleConnectionLost(toggle){
    if(toggle){
        connectionlostdiv.style.display = "block";
    }else{
        connectionlostdiv.style.display = "none";
    }
}

// #endregion