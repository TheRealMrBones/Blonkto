import ClientConfig from "../../configs/client.js";
const { MESSAGE_TIME, MAX_MESSAGE_COUNT } = ClientConfig.CHAT;

const chatMessagesDiv = document.getElementById("chatmessages")!;

const messages: any[] = [];
let chatopened = false;

// #region receive messages

/** Shows/Instantiates the given chat message to the client */
export function receiveChatMessage(message: any): void {
    if(messages.length > MAX_MESSAGE_COUNT) removeLastChatMessage();

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

/** Hides the chat message with the given id from being shown without chat opened */
function hideChatMessage(id: string): void {
    const message = messages.find(m => m.id == id);
    if(message){
        if(!chatopened) message.div.style.display = "none";
        message.display = false;
    }
}

/** Toggles the viewing of all chat messages vs just the most recent ones */
export function toggleAllChatShow(show: boolean): void {
    chatopened = show;
    const ms = messages.filter(m => !m.display);
    ms.forEach(m => {
        m.div.style.display = show ? "block" : "none";
    });
}

/** Completely removes the oldest chat message from the chat history */
function removeLastChatMessage(): void {
    const message = messages[0];
    chatMessagesDiv.removeChild(message.div);
    messages.shift();
}

// #endregion

// #region helpers

/** Returns an html safe version of the given string */
function makeStringHtmlSafe(str: string): string {
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}

// #endregion