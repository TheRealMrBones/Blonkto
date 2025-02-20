import { connect, createaccount, login, play } from "./networking.js";
import { stopRendering } from "./render.js";
import { stopCapturingInput } from "./input.js";
import { downloadAssets } from "./assets.js";
import { initState } from "./state.js";
import { hideUi } from "./ui.js";

import "./main.css";

// #region init

const startMenu = document.getElementById("startmenu")!;
const changeLog = document.getElementById("changelog")!;

const playButton = document.getElementById("playbutton")!;
const changeLogButton = document.getElementById("changelogbutton")!;
const hidechangeLogButton = document.getElementById("hidechangelogbutton")!;

const usernameInput = document.getElementById("usernameinput") as HTMLInputElement;
const passwordInput = document.getElementById("passwordinput") as HTMLInputElement;
const loginDiv = document.getElementById("logindiv")!;
const playDiv = document.getElementById("playdiv")!;
const errorDiv = document.getElementById("errordiv")!;
const loginButton = document.getElementById("loginbutton")!;
const createAccountButton = document.getElementById("createaccountbutton")!;
const usernameDiv = document.getElementById("usernamediv")!;

let account;

// #endregion

// #region prepare game

Promise.all([
    connect(onGameOver),
    downloadAssets(),
]).then(() => {
    usernameInput.focus();
    usernameInput.addEventListener("keyup", event => {
        event.preventDefault();
        if(event.key === "Enter") sendcreateaccount();
    });
    passwordInput.addEventListener("keyup", event => {
        event.preventDefault();
        if(event.key === "Enter") sendlogin();
    });

    createAccountButton.onclick = sendcreateaccount;
    loginButton.onclick = sendlogin;

    playButton.onclick = joingame;

    changeLogButton.onclick = () => {
        changeLog.style.display = "block";
        startMenu.style.display = "none";
    };
    hidechangeLogButton.onclick = () => {
        changeLog.style.display = "none";
        startMenu.style.display = "block";
    };
}).catch(console.error);

// #endregion

// #region login

/** Tries to send the create account message to the server */
function sendcreateaccount(): void {
    if(!usernameInput.value || !passwordInput.value){
        errorDiv.innerHTML = "must provide a username and password";

        return;
    }

    createaccount(usernameInput.value, passwordInput.value);

    usernameInput.value = "";
    passwordInput.value = "";
    usernameInput.blur();
    passwordInput.blur();
}

/** Tries to send the login message to the server */
function sendlogin(): void {
    if(!usernameInput.value || !passwordInput.value){
        errorDiv.innerHTML = "must provide a username and password";

        return;
    }

    login(usernameInput.value, passwordInput.value);

    usernameInput.value = "";
    passwordInput.value = "";
    usernameInput.blur();
    passwordInput.blur();
}

/** Opens up the play UI after successful login with the server */
export function onlogin(response: any): void {
    if(response.account){
        response.error = "";

        usernameDiv.innerHTML = `Logged in as: ${response.account.username}`;

        loginDiv.style.display = "none";
        playDiv.style.display = "block";

        account = response.account;

        playButton.focus();
    }else if(response.error){
        errorDiv.innerHTML = response.error;
    }
}

// #endregion

// #region state changes

/** Tries to join the server game and initialize client state */
function joingame(): void {
    play();
    initState();
}

/** Client response to connection refused message from server */
export function connectionRefused(info: any): void {
    errorDiv.innerHTML = `Connection refused: ${info.reason}`;
    if(info.extra){
        errorDiv.innerHTML += `<br>${info.extra}`;
    }
}

/** Client response to connection accepted message from server */
export function connectionAccepted(): void {
    startMenu.style.display = "none";
}

/** Reverts back to the play UI after server death message */
function onGameOver(connectionrefusedinfo: any): void {
    if(connectionrefusedinfo){
        connectionRefused(connectionrefusedinfo);
    }

    stopCapturingInput();
    stopRendering();
    hideUi();
    startMenu.style.display = "block";
    playButton.focus();
}

// #endregion

//
// TEMP CODE FOR FAST LOGIN!!!
//

document.addEventListener("keydown", devlogin);

/** Temp quick login code for development */
function devlogin(event: any): void {
    if (event.target.tagName.toLowerCase() !== "input" && 
        event.target.tagName.toLowerCase() !== "textarea") {
    
        switch(event.key){
            case "1":
                usernameInput.value = "testuser1";
                passwordInput.value = "testuser1";
                sendlogin();
                document.removeEventListener("keydown", devlogin);
                break;
            case "2":
                usernameInput.value = "testuser2";
                passwordInput.value = "testuser2";
                sendlogin();
                document.removeEventListener("keydown", devlogin);
                break;
            case "3":
                usernameInput.value = "testuser3";
                passwordInput.value = "testuser3";
                sendlogin();
                document.removeEventListener("keydown", devlogin);
                break;
            case "4":
                usernameInput.value = "testuser4";
                passwordInput.value = "testuser4";
                sendlogin();
                document.removeEventListener("keydown", devlogin);
                break;
        }
    }
}