import UiText from "client/render/ui/elements/uiText.js";

/** The ui display for general client and world info */
class InfoUi extends UiText {
    private readonly uiinfotexts: string[] = [
        "Health:",
        "Coords:",
        "Kills:",
        "FPS:",
        "Ping:",
        "TPS:",
    ];
    
    constructor(){
        super("", 18);

        this.setBackgroundColor("rgba(128, 128, 128, 0.5)")
            .setPadding(5)
            .setPosition([5, 5]);

        this.updateUiInfo();
    }

    // #region update

    /** Updates the uiinfo uiText to use the new text list */
    private updateUiInfo(): void {
        let text = this.uiinfotexts[0];
        for(let i = 1; i < this.uiinfotexts.length; i++){
            text += `\n${this.uiinfotexts[i]}`;
        }

        this.setText(text);
    }

    /** Updates the health UI to the given value */
    updateHealth(health: number): void {
        this.uiinfotexts[0] = `Health: ${Math.round(health).toString()}`;
        this.updateUiInfo();
    }

    /** Updates the coordinates UI to the given position */
    updateCoords(x: number, y: number): void {
        this.uiinfotexts[1] = `Coords: ${x.toFixed(1)}, ${y.toFixed(1)}`;
        this.updateUiInfo();
    }

    /** Updates the kills UI to the given value */
    updateKills(kills: number): void {
        this.uiinfotexts[2] = `Kills: ${kills.toString()}`;
        this.updateUiInfo();
    }

    /** Updates the FPS UI to the given value */
    updateFps(fps: number): void {
        this.uiinfotexts[3] = `FPS: ${Math.round(fps).toString()}`;
        this.updateUiInfo();
    }

    /** Updates the ping UI to the given value */
    updatePing(ping: number): void {
        this.uiinfotexts[4] = `Ping: ${Math.round(ping).toString()}`;
        this.updateUiInfo();
    }

    /** Updates the TPS UI to the given value */
    updateTps(tps: number): void {
        this.uiinfotexts[5] = `TPS: ${tps}`;
        this.updateUiInfo();
    }

    // #endregion
}

export default InfoUi;
