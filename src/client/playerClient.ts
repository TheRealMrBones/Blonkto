import { Socket } from "socket.io-client";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    socket: Socket;

    constructor(socket: Socket){
        this.socket = socket;
    }
}

export default PlayerClient;