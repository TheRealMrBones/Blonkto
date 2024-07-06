const Constants = require('../shared/constants');
const { MESSAGE_TIME } = Constants;

const chatMessagesDiv = document.getElementById('chatmessages');

const messages = {};

export function receiveChatMessage(message){
    console.log(message.text);
    const newDiv = document.createElement("div");
    newDiv.id = message.id;
    newDiv.innerHTML = makeStringHtmlSafe(message.text);
    chatMessagesDiv.appendChild(newDiv);
    messages[message.id] = {
        div: newDiv,
    };
    setTimeout(() => { removeChatMessage(message.id) }, MESSAGE_TIME * 1000);
}

function removeChatMessage(id){
    chatMessagesDiv.removeChild(messages[id].div);
    delete messages[id];
}

function makeStringHtmlSafe(str){
    return str.replace('<', "&lt;").replace('>', "&gt;").replace('&', "&amp;").replace('"', "&quot;").replace('\'', "&apos;");
}