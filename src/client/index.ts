import PlayerClient from "./playerClient.js";
import { stopRendering } from "./render/render.js";
import { downloadAssets } from "./render/assets.js";
import { hideUi } from "./render/ui.js";
import { FailedConnectionContent, JoinGameContent } from "../shared/messageContentTypes.js";

import "./main.css";

// #region init

const startMenu = document.getElementById("startmenu")!;

const playButton = document.getElementById("playbutton")!;
const logoutButton = document.getElementById("logoutbutton")!;

const usernameInput = document.getElementById("usernameinput") as HTMLInputElement;
const passwordInput = document.getElementById("passwordinput") as HTMLInputElement;
const loginDiv = document.getElementById("logindiv")!;
const playDiv = document.getElementById("playdiv")!;
const errorDiv = document.getElementById("errordiv")!;
const loginButton = document.getElementById("loginbutton")!;
const createAccountButton = document.getElementById("createaccountbutton")!;
const usernameDiv = document.getElementById("usernamediv")!;

// #endregion

// #region prepare game

// initialize the player client
export const playerclient = new PlayerClient();

// conect the client to the server
Promise.all([
    downloadAssets(),
]).then(() => {
    usernameInput.focus();
    usernameInput.addEventListener("keyup", event => {
        event.preventDefault();
        if(event.key === "Enter") sendLogin();
    });
    passwordInput.addEventListener("keyup", event => {
        event.preventDefault();
        if(event.key === "Enter") sendLogin();
    });

    createAccountButton.onclick = sendCreateAccount;
    loginButton.onclick = sendLogin;

    playButton.onclick = joinGame;
    logoutButton.onclick = sendLogout;
    
    // try silent login if have old token
    const token = getCookie("token");
    if(token !== null){
        verifyToken(token);
    }
}).catch(console.error);

// #endregion

// #region login

/** Tries to send the create account message to the server */
function sendCreateAccount(): void {
    const username = usernameInput.value;
    const password = passwordInput.value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/register", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            if(xhr.status == 201){
                sendLogin();
            }else{
                const data = JSON.parse(xhr.responseText);
                showError("Registration failed: " + data.error);
            }
        }
    };

    // Convert the data to JSON format
    const jsonData = JSON.stringify({
        username: username,
        password: password
    });

    // Send the request
    xhr.send(jsonData);
}

/** Tries to send the login message to the server */
function sendLogin(): void {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if(!username || !password){
        errorDiv.innerHTML = "must provide a username and password";
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                const data = JSON.parse(xhr.responseText);

                // Check if login was successful
                if(data.token){
                    onLogin(username);
                }else{
                    // Display the error message from the server
                    showError("Login failed: " + data.error);
                }
            }else if(xhr.status == 401) {
                // Unauthorized - Incorrect username or password
                showError("Invalid username or password. Please try again.");
            }else{
                // Handle other server errors or HTTP status codes
                showError("Failed to make the login request. Please try again later.");
            }
        }
    };

    // Convert the data to JSON format
    const jsonData = JSON.stringify({
        username: username,
        password: password
    });

    // Send the request
    xhr.send(jsonData);

    usernameInput.value = "";
    passwordInput.value = "";
    usernameInput.blur();
    passwordInput.blur();
}

/** Logs the user out of their current account */
function sendLogout(): void {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/logout", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                errorDiv.innerHTML = "";

                loginDiv.style.display = "block";
                playDiv.style.display = "none";

                usernameInput.focus();
                
                document.addEventListener("keydown", devlogin);
            }else{
                showError("Logout failed. Please try again.");
            }
        }
    };

    // Send the request
    xhr.send();
}

/** Tries to send the verify token message to the server */
function verifyToken(token: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/verify", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                const data = JSON.parse(xhr.responseText);

                // Check if login was successful
                if(data.valid){
                    onLogin(data.username);
                }else{
                    // Display the error message from the server
                    showError("Login failed: " + data.error);
                }
            }
        }
    };

    // Convert the data to JSON format
    const jsonData = JSON.stringify({
        token: token
    });

    // Send the request
    xhr.send(jsonData);
}

/** Opens up the play UI after successful login with the server */
function onLogin(username: string): void {
    console.log(`Logged in as: ${username}`);
    usernameDiv.innerHTML = `Logged in as: ${username}`;

    loginDiv.style.display = "none";
    playDiv.style.display = "block";

    playButton.focus();

    // TEMP CODE FOR DEV LOGON!!!!!!!!!!
    document.removeEventListener("keydown", devlogin);
}

// #endregion

// #region state changes

/** Tries to join the server game and initialize client state */
function joinGame(): void {
    const token = getCookie("token");
    if(token === null) return;
    const content: JoinGameContent = {
        token: token,
    };

    playerclient.networkingManager.play(content);
    playerclient.stateManager.initState();
}

/** Client response to connection refused message from server */
export function connectionRefused(info: FailedConnectionContent): void {
    errorDiv.innerHTML = `Connection refused: ${info.reason}`;
    if(info.extra) errorDiv.innerHTML += `<br>${info.extra}`;
}

/** Client response to connection accepted message from server */
export function connectionAccepted(): void {
    startMenu.style.display = "none";
}

/** Reverts back to the play UI after server death message */
export function onGameOver(connectionrefusedinfo: any): void {
    if(connectionrefusedinfo) connectionRefused(connectionrefusedinfo);

    playerclient.inputManager.stopCapturingInput();
    stopRendering();
    hideUi();
    startMenu.style.display = "block";
    playButton.focus();
}

// #endregion

// #region helpers

/** Displays the given error in the main menu */
function showError(error: string): void{
    errorDiv.innerHTML = error;
}

/** Returns the requested cookie if it exists */
function getCookie(name: string): string | null {
    const cookies = document.cookie.split(";");
    for(let i = 0; i < cookies.length; i++){
        const cookie = cookies[i].trim();
        if(cookie.startsWith(name + "=")) return cookie.substring(name.length + 1);
    }
    return null;
}

// #endregion

//
// TEMP CODE FOR FAST LOGIN!!!
//

document.addEventListener("keydown", devlogin);

/** Temp quick login code for development */
function devlogin(event: any): void {
    if(event.target.tagName.toLowerCase() !== "input" && 
        event.target.tagName.toLowerCase() !== "textarea") {
    
        switch(event.key){
            case "1":
                usernameInput.value = "testuser1";
                passwordInput.value = "testuser1";
                sendLogin();
                break;
            case "2":
                usernameInput.value = "testuser2";
                passwordInput.value = "testuser2";
                sendLogin();
                break;
            case "3":
                usernameInput.value = "testuser3";
                passwordInput.value = "testuser3";
                sendLogin();
                break;
            case "4":
                usernameInput.value = "testuser4";
                passwordInput.value = "testuser4";
                sendLogin();
                break;
        }
    }
}