import PlayerClient from "client/playerClient.js";
import UiImage from "client/render/ui/elements/uiImage.js";
import Constants from "shared/constants.js";
import { AnchorDirection } from "shared/physics/anchorDirection.js";

const { ASSETS } = Constants;

/** The ui display for when the connection to the server is lost or delayed */
class ConnectionLostUi extends UiImage {
    private readonly playerclient: PlayerClient;

    constructor(playerclient: PlayerClient){
        super(null);

        this.setAnchorDirection(AnchorDirection.TOP_RIGHT)
            .setPosition([5, 5])
            .hide();

        this.playerclient = playerclient;
    }

    // #region update

    /** Toggles the connection lost icon to appear or disapear */
    toggleConnectionLost(toggle: boolean): void {
        if(this.getImage() === null)
            this.setImage(this.playerclient.renderer.assetManager.getAssetRender(ASSETS.CONNECTION_LOST_ICON, "connection_lost", 80));

        if(toggle){
            this.show();
        }else{
            this.hide();
        }
    }

    // #endregion
}

export default ConnectionLostUi;
