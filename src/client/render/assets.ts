import { equalColor, getBaseColor } from "../../shared/typeOperations.js";
import { Color } from "../../shared/types.js";

import Constants from "../../shared/constants.js";
const { ASSETS } = Constants;

type AssetCache = {
    image: OffscreenCanvas,
    scale: number,
    color: Color,
};

const assetsbase: {[key: string]: HTMLImageElement} = {};
const assetscache: {[key: string]: AssetCache[] } = {};

// #region manage assets

const downloadPromise = Promise.all(Object.values(ASSETS).map(downloadAsset));

/** Prepares an individual asset and loads it into memory */
function downloadAsset(assetName: string): Promise<void> {
    return new Promise<void>(resolve => {
        const asset = new Image();
        asset.onload = () => {
            assetsbase[assetName] = asset;
            resolve();
        };
        asset.src = `/${assetName}`;
    });
}

/** Prepares all of the assets the client would be using in the game */
export const downloadAssets = (): Promise<void[]> => downloadPromise;

/** Returns the image asset with the given name */
export function getAsset(assetname: string, scale: number, color?: Color, scaleheight?: boolean): OffscreenCanvas | null {
    if(assetname === undefined) return null;
    if(color === undefined) color = getBaseColor();
    if(!assetscache[assetname]) assetscache[assetname] = [];

    const foundasset = assetscache[assetname].find(a => a.scale == scale && equalColor(a.color as Color, color));
    if(foundasset !== undefined) return foundasset.image;

    // create new asset cache
    const model = assetsbase[assetname];
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

    assetscache[assetname].push({
        image: offscreen,
        scale: scale,
        color: color,
    });
    return offscreen;
}

// #endregion