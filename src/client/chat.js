const Constants = require('../shared/constants');
const { MESSAGE_TIME, MAX_MESSAGE_COUNT } = Constants;

const chatMessagesDiv = document.getElementById('chatmessages');

const messages = {};
const localMessageNum = 0;

export function receiveChatMessage(message){
    localMessageNum++;
    if(localMessageNum > MAX_MESSAGE_COUNT){
        removeLastChatMessage();
    }

    const newDiv = document.createElement("div");
    newDiv.id = message.id;
    newDiv.innerHTML = makeStringHtmlSafe(message.text);
    chatMessagesDiv.appendChild(newDiv);
    messages[message.id] = {
        div: newDiv,
        display: true,
    };
    setTimeout(() => { hideChatMessage(message.id) }, MESSAGE_TIME * 1000);
}

function hideChatMessage(id){
    messages[id].div.style.display = "none";
    messages[id].display = false;
}

function removeChatMessage(id){
    chatMessagesDiv.removeChild(messages[id].div);
    delete messages[id];

function removeLastChatMessage(){
    chatMessagesDiv.removeChild(messages[id].div);
    delete messages[id];

    let smallestid;
    let smallestnum = 0;
    messages.array.forEach(message => {
        if(){
            
        }
    });
}

function makeStringHtmlSafe(str){
    return str.replaceAll('&', "&amp;").replaceAll('<', "&lt;").replaceAll('>', "&gt;").replaceAll('"', "&quot;").replaceAll('\'', "&apos;");
}