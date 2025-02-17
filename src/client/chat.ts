import ClientConfig from "../configs/client.js";
const { MESSAGE_TIME, MAX_MESSAGE_COUNT } = ClientConfig.CHAT;

const chatMessagesDiv = document.getElementById("chatmessages")!;

const messages: any[] = [];

// #region receive messages

export function receiveChatMessage(message: any){
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
    setTimeout(() => { hideChatMessage(message.id); }, MESSAGE_TIME * 1000);
}

// #endregion

// #region message visibility

function hideChatMessage(id: string){
    const message = messages.find(m => m.id == id);
    if(message){
        if(!chatopened){
            message.div.style.display = "none";
        }
        message.display = false;
    }
}

let chatopened = false;
export function toggleAllChatShow(show: boolean){
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

// #endregion

// #region helpers

function makeStringHtmlSafe(str: string){
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}

// #endregion