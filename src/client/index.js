import { connect, login, play } from './networking.js';
import { stopRendering } from './render.js';
import { stopCapturingInput } from './input.js';
import { downloadAssets } from './assets.js';
import { initState } from './state.js';
import { hideUi } from './ui.js';

import './main.css';

// #region init

const startMenu = document.getElementById('startmenu');
const changeLog = document.getElementById('changelog');
const playButton = document.getElementById('playbutton');
const changeLogButton = document.getElementById('changelogbutton');
const hidechangeLogButton = document.getElementById('hidechangelogbutton');
const usernameInput = document.getElementById('usernameinput');
const passwordInput = document.getElementById('passwordinput');
const loginDiv = document.getElementById('logindiv');
const playDiv = document.getElementById('playdiv');
const errorDiv = document.getElementById('errordiv');

let account;

// #endregion

// #region prepare game

Promise.all([
    connect(onGameOver),
    downloadAssets(),
]).then(() => {
    usernameInput.focus();
    usernameInput.addEventListener("keyup", sendlogin);
    passwordInput.addEventListener("keyup", sendlogin);

    playButton.onclick = () => {
        init();
    };

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

function sendlogin(event){
    event.preventDefault();
    if(event.key === "Enter"){
        if(!usernameInput.value || !passwordInput.value){
            errorDiv.innerHTML = "must provide a username and password";

            return;
        }

        login(usernameInput.value, passwordInput.value)

        usernameInput.value = "";
        passwordInput.value = "";
        usernameInput.blur();
        passwordInput.blur();
    }
}

export function onlogin(response){
    if(response.account){
        response.error = "";

        loginDiv.style.display = "none";
        playDiv.style.display = "block";

        account = response.account;
    }else if(response.error){
        errorDiv.innerHTML = response.error;
    }
}

// #endregion

// #region state changes

function init(){
    play(account.username);
    startMenu.style.display = "none";
    initState();
}

function onGameOver(){
    stopCapturingInput();
    stopRendering();
    hideUi();
    startMenu.style.display = "block";
    playButton.focus();
}

// #endregion