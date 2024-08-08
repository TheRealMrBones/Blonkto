import { chat } from './networking.js';
import { pauseCapturingInputs, resumeCapturingInputs } from './input.js';

const chatDiv = document.getElementById('chat');
const chatInput = document.getElementById('chatinput');
const coordsdiv = document.getElementById('coords');
const coordstext = document.getElementById('coordstext');
const connectionlostdiv = document.getElementById('connectionlost');

let focusingOut = false;

export function setupUi(){
    chatDiv.style.display = "block";
    coordsdiv.style.display = "block";

    window.addEventListener("keyup", keyUpChecks);

    chatInput.addEventListener("keyup", function(event){
        event.preventDefault();
        if(event.key === "Enter"){
            chat({
                text: chatInput.value,
            });
            chatInput.blur();
        }
    });

    chatInput.addEventListener("focusin", function(){
        pauseCapturingInputs();
        window.removeEventListener("keyup", keyUpChecks);
    });
    chatInput.addEventListener("focusout", function(){
        resumeCapturingInputs();
        chatInput.value = "";
        focusingOut = true;
        window.addEventListener("keyup", keyUpChecks);
    });
}

function keyUpChecks(event){
    event.preventDefault();
    switch(event.key){
        case "Enter": {
            if(focusingOut){
                focusingOut = !focusingOut;
            }else{
                chatInput.focus();
            }
            break;
        }
        case "/": {
            chatInput.focus();
            chatInput.value = "/";
            break;
        }
    }
}

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