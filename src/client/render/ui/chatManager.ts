import PlayerClient from "../../playerClient.js";
import { ReceiveMessageContent } from "../../../shared/messageContentTypes.js";

import ClientConfig from "../../../configs/client.js";
const { MESSAGE_TIME, MAX_MESSAGE_COUNT } = ClientConfig.CHAT;

/** Manages the client chat log and operations */
class ChatManager {
    private readonly playerclient: PlayerClient;

    private readonly chatMessagesDiv: HTMLElement = document.getElementById("chatmessages")!;
    private readonly messages: any[] = [];
    private chatopened: boolean = false;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    // #region receive messages

    /** Shows/Instantiates the given chat message to the client */
    receiveChatMessage(message: ReceiveMessageContent): void {
        if(this.messages.length > MAX_MESSAGE_COUNT) this.removeLastChatMessage();

        const newDiv = document.createElement("div");
        newDiv.id = message.id;
        newDiv.innerHTML = makeStringHtmlSafe(message.text);
        this.chatMessagesDiv.appendChild(newDiv);
        this.messages.push({
            id: message.id,
            div: newDiv,
            display: true,
        });
        setTimeout(() => { this.hideChatMessage(message.id); }, MESSAGE_TIME * 1000);
    }

    // #endregion

    // #region message visibility

    /** Hides the chat message with the given id from being shown without chat opened */
    private hideChatMessage(id: string): void {
        const message = this.messages.find(m => m.id == id);
        if(message){
            if(!this.chatopened) message.div.style.display = "none";
            message.display = false;
        }
    }

    /** Toggles the viewing of all chat messages vs just the most recent ones */
    toggleAllChatShow(show: boolean): void {
        this.chatopened = show;
        const ms = this.messages.filter(m => !m.display);
        ms.forEach(m => {
            m.div.style.display = show ? "block" : "none";
        });
    }

    /** Completely removes the oldest chat message from the chat history */
    private removeLastChatMessage(): void {
        const message = this.messages[0];
        this.chatMessagesDiv.removeChild(message.div);
        this.messages.shift();
    }

    // #endregion
}

// #region helpers

/** Returns an html safe version of the given string */
function makeStringHtmlSafe(str: string): string {
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}

// #endregion

export default ChatManager;
