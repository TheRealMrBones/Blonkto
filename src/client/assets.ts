import Constants from "../shared/constants.js";
const { ASSETS } = Constants;

const assets: {[key: string]: HTMLImageElement} = {};

// #region manage assets

const downloadPromise = Promise.all(Object.values(ASSETS).map(downloadAsset));

function downloadAsset(assetName: string){
    return new Promise<void>(resolve => {
        const asset = new Image();
        asset.onload = () => {
            console.log(`Downloaded ${assetName}`);
            assets[assetName] = asset;
            resolve();
        };
        asset.src = `/${assetName}`;
    });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = (assetName: string) => assets[assetName];

// #endregion

// #region colorize

const coloredAssets: { [key: string]: { asset: OffscreenCanvas; color: Color } } = {};
const assetVariants: { [key: string]: { [variant: string]: OffscreenCanvas } } = {};
const coloredAssetVariants: { [key: string]: { [variant: string]: OffscreenCanvas } } = {};

export function getColoredAsset(object: { id: string; color: Color; asset: string; }){
    // make new if asset doesn't exist
    let makenew = !coloredAssets[object.id];

    // make new if asset color changed
    if(!makenew){
        const oldcolor = coloredAssets[object.id].color;
        const newcolor = object.color;

        if(oldcolor.r != newcolor.r || oldcolor.g != newcolor.g || oldcolor.b != newcolor.b){
            // delete old colored variants aswell
            if(coloredAssetVariants[object.id]){
                for (const prop in coloredAssetVariants[object.id]) {
                    if (coloredAssetVariants[object.id].hasOwnProperty(prop)) {
                        delete coloredAssetVariants[object.id][prop];
                    }
                }
            }

            makenew = true;
        }
    }

    // if needed make new colored asset
    if(makenew){
        coloredAssets[object.id] = {
            asset: colorize(getAsset(object.asset), object.color),
            color: object.color,
        };
    }

    return coloredAssets[object.id].asset;
}

export function getAssetVariant(asset: string, varient: string, varientrgb: Color){
    const assetObj = getAsset(asset);
    if(!assetVariants[asset]){
        assetVariants[asset] = {};
    }
    if(!assetVariants[asset][varient]){
        assetVariants[asset][varient] = colorize(assetObj, varientrgb);
    }
    return assetVariants[asset][varient];
}

export function getColoredAssetVariant(object: { id: string; color: Color; asset: string; }, varient: string, varientrgb: Color){
    const coloredAsset = getColoredAsset(object);
    if(!coloredAssetVariants[object.id]){
        coloredAssetVariants[object.id] = {};
    }
    if(!coloredAssetVariants[object.id][varient]){
        coloredAssetVariants[object.id][varient] = colorize(coloredAsset, varientrgb);
    }
    return coloredAssetVariants[object.id][varient];
}

function colorize(image: HTMLImageElement | OffscreenCanvas, color: Color){
    const imageWidth = image.width;
    const imageHeight = image.height;

    const offscreen = new OffscreenCanvas(imageWidth, imageHeight);
    const ctx = offscreen.getContext("2d")!;

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

    for(let i = 0; i < imageData.data.length; i += 4){
        imageData.data[i + 0] *= color.r;
        imageData.data[i + 1] *= color.g;
        imageData.data[i + 2] *= color.b;
    }

    ctx.putImageData(imageData, 0, 0);

    return offscreen;
}

// #endregion