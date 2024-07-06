const chatMessagesDiv = document.getElementById('chatmessages');

const intervals = {};

export function receiveChatMessage(message){
    const interval = setInterval(removeChatMessage(message.id), 1000 / Constants.CLIENT_UPDATE_RATE);
    intervals[message.id] = interval;
}

function removeChatMessage(id){
    clearInterval(intervals[id]);
    delete intervals[id];
}