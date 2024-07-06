import { chat } from './networking.js';
import { pauseCapturingInputs, resumeCapturingInputs } from './input.js';

const chatDiv = document.getElementById('chat');
const chatInput = document.getElementById('chatinput');

let focusingOut = false;

export function setupUi(){
    chatDiv.style.display = "block";

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