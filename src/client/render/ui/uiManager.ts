import PlayerClient from "client/playerClient.js";
import ConnectionLostUi from "client/render/ui/components/connectionLostUi.js";
import InfoUi from "client/render/ui/components/infoUi.js";
import TabUi from "client/render/ui/components/tabUi.js";
import UiElement from "client/render/ui/elements/uiElement.js";
import SharedConfig from "configs/shared.js";
import { SendMessageContent, DropContent } from "shared/messageContentTypes.js";

const { SHOW_TAB } = SharedConfig.TAB;

/** Manages all UI updating and interaction for the client */
class UiManager {
    private readonly playerclient: PlayerClient;

    private readonly uielements: UiElement[];
    readonly infoui: InfoUi;
    readonly connectionlostui: ConnectionLostUi;
    readonly tabui: TabUi;

    private readonly chatDiv: HTMLElement = document.getElementById("chat")!;
    private readonly chatInput: HTMLInputElement = document.getElementById("chatinput") as HTMLInputElement;
    private readonly hotbardiv: HTMLElement = document.getElementById("hotbar")!;
    private readonly inventorydiv: HTMLElement = document.getElementById("inventory")!;
    private readonly stationdiv: HTMLElement = document.getElementById("station")!;

    private keyDownChecksListener: ((event: any) => void) = this.keyDownChecks.bind(this);
    private keyUpChecksListener: ((event: any) => void) = this.keyUpChecks.bind(this);
    private chatInputKeyUpListener: ((event: any) => void) = this.chatInputKeyUp.bind(this);
    private chatInputFocusListener: ((event: any) => void) = this.chatInputFocus.bind(this);
    private chatInputUnfocusListener: ((event: any) => void) = this.chatInputUnfocus.bind(this);
    private keyUpChecksInventoryListener: ((event: any) => void) = this.keyUpChecksInventory.bind(this);

    private focusingOut: boolean = false;
    private inventoryopen: boolean = false;
    private ignorechatenter: number = 0;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;

        // create all base ui components
        this.infoui = new InfoUi();
        this.connectionlostui = new ConnectionLostUi(playerclient);
        this.tabui = new TabUi();

        this.uielements = [
            this.infoui,
            this.connectionlostui,
            this.tabui,
        ];

        // prepare event listeners
        for(let i = 0; i < 63; i++){
            const hotbarslot = document.getElementById("slot" + (i + 1))!;
            hotbarslot.addEventListener("click", function() {
                playerclient.inputManager.selectSlot(i);
            });
        }
    }

    // #region main functions

    /** Renders all of the ui onto the given canvas */
    renderUi(context: CanvasRenderingContext2D): void {
        for(const element of this.uielements){
            if(!element.isHidden()) element.render(context);
        }
    }

    /** Prepares and shows the game UI */
    setupUi(): void {
        // show ui
        this.chatDiv.style.display = "block";
        this.hotbardiv.style.display = "block";

        // add event listeners
        window.addEventListener("keydown", this.keyDownChecksListener);
        window.addEventListener("keyup", this.keyUpChecksListener);
        this.chatInput.addEventListener("keyup", this.chatInputKeyUpListener);
        this.chatInput.addEventListener("focusin", this.chatInputFocusListener);
        this.chatInput.addEventListener("focusout", this.chatInputUnfocusListener);

        // prepare ignorechatenter
        this.ignorechatenter = Date.now();
    }

    /** Hides the game UI */
    hideUi(): void {
        // hide ui
        this.chatDiv.style.display = "none";
        this.hotbardiv.style.display = "none";
        this.inventorydiv.style.display = "none";
        this.inventoryopen = false;

        // remove event listeners
        window.removeEventListener("keydown", this.keyDownChecksListener);
        window.removeEventListener("keyup", this.keyUpChecksListener);
        this.chatInput.removeEventListener("keyup", this.chatInputKeyUpListener);
        this.chatInput.removeEventListener("focusin", this.chatInputFocusListener);
        this.chatInput.removeEventListener("focusout", this.chatInputUnfocusListener);
    }

    // #endregion

    // #region event functions

    /** Handles UI related key down events */
    private keyDownChecks(event: KeyboardEvent): void {
        switch(event.key){
            case "Tab": {
                if(SHOW_TAB) this.tabui.show();
                event.preventDefault();
                break;
            }
        }
    }

    /** Handles UI related key up events */
    private keyUpChecks(event: KeyboardEvent): void {
        event.preventDefault();
        switch(event.key){
            case "e": {
                if(!this.inventoryopen){
                    this.openInventory();
                }
                break;
            }
            case "Enter": {
                if(Date.now() - this.ignorechatenter < 500){
                    // ignore open chat if enter was used to start the game
                }else if(this.focusingOut){
                    this.focusingOut = !this.focusingOut;
                }else{
                    this.chatInput.focus();
                    this.playerclient.renderer.chatManager.toggleAllChatShow(true);
                }
                break;
            }
            case "/": {
                this.chatInput.focus();
                this.chatInput.value = "/";
                this.playerclient.renderer.chatManager.toggleAllChatShow(true);
                break;
            }
            case "Tab": {
                if(SHOW_TAB) this.tabui.hide();
                break;
            }
        }
    }

    /** Handles chat UI related keyboard events */
    private chatInputKeyUp(event: KeyboardEvent): void {
        event.preventDefault();
        if(event.key === "Enter"){
            const content: SendMessageContent = {
                text: this.chatInput.value,
            };
            this.playerclient.networkingManager.chat(content);
            this.focusingOut = true;
            this.chatInput.value = "";
            this.chatInput.blur();
            this.playerclient.renderer.chatManager.toggleAllChatShow(false);
        }
    }

    /** Handles chat UI related focus events */
    private chatInputFocus(event: FocusEvent): void {
        if(this.inventoryopen) this.closeInventory();

        this.playerclient.inputManager.pauseCapturingInputs();
        window.removeEventListener("keydown", this.keyDownChecksListener);
        window.removeEventListener("keyup", this.keyUpChecksListener);
        this.playerclient.renderer.chatManager.toggleAllChatShow(true);
    }

    /** Handles chat UI related unfocus events */
    private chatInputUnfocus(event: FocusEvent): void {
        this.playerclient.inputManager.resumeCapturingInputs();
        window.addEventListener("keydown", this.keyDownChecksListener);
        window.addEventListener("keyup", this.keyUpChecksListener);
        this.playerclient.renderer.chatManager.toggleAllChatShow(false);
    }

    /** Handles the open inventory action */
    openInventory(): void {
        this.inventoryopen = true;
        this.inventorydiv.style.display = "block";
        this.playerclient.inputManager.pauseCapturingInputs();
        window.removeEventListener("keydown", this.keyDownChecksListener);
        window.removeEventListener("keyup", this.keyUpChecksListener);
        window.addEventListener("keyup", this.keyUpChecksInventoryListener);
        this.playerclient.inputManager.pauseHotbar();
    }

    /** Handles the open station action */
    openStation(): void {
        this.stationdiv.style.display = "block";
        this.openInventory();
    }

    /** Handles the close inventory action */
    private closeInventory(): void {
        this.inventoryopen = false;
        this.inventorydiv.style.display = "none";
        this.stationdiv.style.display = "none";
        this.playerclient.inputManager.resumeCapturingInputs();
        window.addEventListener("keydown", this.keyDownChecksListener);
        window.addEventListener("keyup", this.keyUpChecksListener);
        window.removeEventListener("keyup", this.keyUpChecksInventoryListener);
        this.playerclient.inputManager.unpauseHotbar();
    }

    /** Handles keyboard inputs when in inventory */
    private keyUpChecksInventory(event: KeyboardEvent): void {
        event.preventDefault();
        switch(event.key){
            case "e": {
                if(this.inventoryopen){
                    this.closeInventory();
                    this.playerclient.inventory.setStation(null);
                }
                break;
            }
            case "q": {
                const content: DropContent = {
                    slot: this.playerclient.inputManager.getSelectedSlot(),
                    all: event.ctrlKey,
                };
                this.playerclient.networkingManager.drop(content);
                break;
            }
        }

        // hotbar
        const posnum = parseInt(event.key);
        if(!Number.isNaN(posnum) && posnum != 0) this.playerclient.inventory.swapSlots(this.playerclient.inputManager.getSelectedSlot(), posnum - 1);
    }

    // #endregion
}

export default UiManager;
