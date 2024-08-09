const Constants = require('../shared/constants');
const { MESSAGE_TIME, MAX_MESSAGE_COUNT } = Constants;

const chatMessagesDiv = document.getElementById('chatmessages');

const messages = [];

export function receiveChatMessage(message){
    if(messages.length > MAX_MESSAGE_COUNT){
        removeLastChatMessage();
    }

    const newDiv = document.createElement("div");
    newDiv.id = message.id;
    newDiv.innerHTML = makeStringHtmlSafe(message.text);
    chatMessagesDiv.appendChild(newDiv);
    messages.push({
        id: message.id,
        div: newDiv,
        display: true,
    });
    setTimeout(() => { hideChatMessage(message.id) }, MESSAGE_TIME * 1000);
}

function hideChatMessage(id){
    const message = messages.find(m => m.id == id);
    if(message){
        if(chatopened){
            message.div.style.display = "none";
        }
        message.display = false;
    }
}

let chatopened = false;
export function toggleAllChatShow(show){
    chatopened = show;
    const ms = messages.filter(m => !m.display);
    ms.forEach(m => {
        if(show){
            m.div.style.display = "block";
        }else{
            m.div.style.display = "none";
        }
    });
}

function removeLastChatMessage(){
    const message = messages[0];
    chatMessagesDiv.removeChild(message.div);
    messages.shift();
}

function makeStringHtmlSafe(str){
    return str.replaceAll('&', "&amp;").replaceAll('<', "&lt;").replaceAll('>', "&gt;").replaceAll('"', "&quot;").replaceAll('\'', "&apos;");
}