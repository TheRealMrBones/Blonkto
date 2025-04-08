import { Socket } from "socket.io-client";
import Account from "./account.js";

/** The base class for the client to interact with the game once they are logged in */
class PlayerClient {
    socket: Socket;
    account: Account;

    constructor(socket: Socket, account: Account){
        this.socket = socket;
        this.account = account;
    }
}

export default PlayerClient;