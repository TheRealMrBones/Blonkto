import { connect, play } from './networking.js';
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

// #endregion

// #region prepare game

Promise.all([
    connect(onGameOver),
    downloadAssets(),
]).then(() => {
    usernameInput.focus();
    usernameInput.addEventListener("keyup", function(event){
        event.preventDefault();
        if(event.key === "Enter"){
            init();
        }
    });
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

// #region state changes

function init(){
    if(usernameInput.value.trim().length === 0){
        usernameInput.value = "name is required";
    }else{
        play(usernameInput.value);
        startMenu.style.display = "none";
        initState();
    }
}

function onGameOver(){
    stopCapturingInput();
    stopRendering();
    hideUi();
    startMenu.style.display = "block";
    playButton.focus();
}

// #endregion