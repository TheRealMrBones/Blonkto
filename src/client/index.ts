import { connect, play } from "./networking/networking.js";
import { stopRendering } from "./render/render.js";
import { stopCapturingInput } from "./input/input.js";
import { downloadAssets } from "./render/assets.js";
import { initState } from "./networking/state.js";
import { hideUi } from "./render/ui.js";
import { FailedConnectionContent, JoinGameContent } from "../shared/messageContentTypes.js";

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

// #endregion

// #region prepare game

Promise.all([
    connect(onGameOver),
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

    changeLogButton.onclick = () => {
        changeLog.style.display = "block";
        startMenu.style.display = "none";
    };
    hidechangeLogButton.onclick = () => {
        changeLog.style.display = "none";
        startMenu.style.display = "block";
    };
    
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
    usernameDiv.innerHTML = `Logged in as: ${username}`;

    loginDiv.style.display = "none";
    playDiv.style.display = "block";

    playButton.focus();
}

// #endregion

// #region state changes

/** Tries to join the server game and initialize client state */
function joinGame(): void {
    const token = getCookie("token");
    if(token === null) return;
    const content: JoinGameContent = {
        token: token,
    }

    play(content);
    initState();
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
function onGameOver(connectionrefusedinfo: any): void {
    if(connectionrefusedinfo) connectionRefused(connectionrefusedinfo);

    stopCapturingInput();
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
    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++){
        const cookie = cookies[i].trim();
        if(cookie.startsWith(name + '=')) return cookie.substring(name.length + 1);
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
                document.removeEventListener("keydown", devlogin);
                break;
            case "2":
                usernameInput.value = "testuser2";
                passwordInput.value = "testuser2";
                sendLogin();
                document.removeEventListener("keydown", devlogin);
                break;
            case "3":
                usernameInput.value = "testuser3";
                passwordInput.value = "testuser3";
                sendLogin();
                document.removeEventListener("keydown", devlogin);
                break;
            case "4":
                usernameInput.value = "testuser4";
                passwordInput.value = "testuser4";
                sendLogin();
                document.removeEventListener("keydown", devlogin);
                break;
        }
    }
}