import PlayerClient from "../playerClient.js";
import { equalColor, getBaseColor } from "../../shared/typeOperations.js";
import { Color } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

type AssetCache = {
    image: OffscreenCanvas,
    scale: number,
    color: Color,
};

/** Manages assets loaded by the client for later rendering */
class AssetManager {
    private readonly playerclient: PlayerClient;

    private readonly assetsbase: {[key: string]: HTMLImageElement} = {};
    private readonly assetscache: {[key: string]: AssetCache[] } = {};

    private readonly downloadPromise: Promise<void[]> = Promise.all(Object.values(ASSETS).map(this.downloadAsset.bind(this)));

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    // #region asset management

    /** Prepares an individual asset and loads it into memory */
    private downloadAsset(assetName: string): Promise<void> {
        return new Promise<void>(resolve => {
            const asset = new Image();
            asset.onload = () => {
                this.assetsbase[assetName] = asset;
                resolve();
            };
            asset.src = `/${assetName}`;
        });
    }

    /** Prepares all of the assets the client would be using in the game */
    downloadAssets = (): Promise<void[]> => this.downloadPromise;

    /** Returns the image asset with the given name */
    getAsset(assetname: string, scale: number, color?: Color, scaleheight?: boolean): OffscreenCanvas | null {
        if(assetname === undefined) return null;
        if(color === undefined) color = getBaseColor();
        if(!this.assetscache[assetname]) this.assetscache[assetname] = [];

        const foundasset = this.assetscache[assetname].find(a => a.scale == scale && equalColor(a.color as Color, color));
        if(foundasset !== undefined) return foundasset.image;

        // create new asset cache
        const model = this.assetsbase[assetname];
        const width = scaleheight ? scale * model.width / model.height : scale;
        const height = scaleheight ? scale : scale * model.height / model.width;

        if(width < 1 || height < 1) return null; // dont draw only subpixels because bug

        const offscreen = new OffscreenCanvas(width + 2, height + 2);
        const ctx = offscreen.getContext("2d")!;

        ctx.drawImage(model, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);

        for(let i = 0; i < imageData.data.length; i += 4){
            imageData.data[i + 0] *= color.r;
            imageData.data[i + 1] *= color.g;
            imageData.data[i + 2] *= color.b;
        }

        ctx.putImageData(imageData, 0, 0);

        this.assetscache[assetname].push({
            image: offscreen,
            scale: scale,
            color: color,
        });
        return offscreen;
    }

    // #endregion
}

export default AssetManager;
