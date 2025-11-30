import UiText from "client/render/ui/elements/uiText.js";
import SharedConfig from "configs/shared.js";
import { AnchorDirection } from "shared/physics/anchorDirection.js";
import { SerializedTab } from "shared/serialization/serializedTab.js";

const { KILLS_TAB } = SharedConfig.TAB;

/** The ui display for the list of online players */
class TabUi extends UiText {
    constructor(){
        super("", 18);

        this.setBackgroundColor("rgba(128, 128, 128, 0.5)")
            .setPadding(5)
            .setAnchorDirection(AnchorDirection.TOP)
            .setPosition([0, 5])
            .hide();
    }

    // #region update

    /** Updates the tab list with the given data */
    updateTab(data: SerializedTab): void {
        if(data.length == 0){
            this.setText("");
            return;
        };

        let newtext = this.getTabString(data[0]);
        for(let i = 1; i < data.length; i++){
            newtext += `\n${this.getTabString(data[i])}`;
        }
        this.setText(newtext);
    }

    /** Returns string representation of a player in tab with the given data */
    private getTabString(playerdata: any): string {
        let text = playerdata.username;
        if(KILLS_TAB) text = playerdata.kills + " " + text;
        return text;
    }

    // #endregion
}

export default TabUi;
