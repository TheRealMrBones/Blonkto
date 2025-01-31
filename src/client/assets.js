import Constants from '../shared/constants';
const { ASSETS } = Constants;

const assets = {};

// #region manage assets

const downloadPromise = Promise.all(Object.values(ASSETS).map(downloadAsset));

function downloadAsset(assetName){
    return new Promise(resolve => {
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

export const getAsset = assetName => assets[assetName];

// #endregion

// #region colorize

const coloredAssets = {};
const assetVariants = {};
const coloredAssetVariants = {};

export function getColoredAsset(object){
    // make new if asset doesn't exist
    let makenew = !coloredAssets[object.id];

    // make new if asset color changed
    if(!makenew){
        const oldcolor = coloredAssets[object.id].color;
        const newcolor = object.color;

        if(oldcolor.r != newcolor.r || oldcolor.g != newcolor.g || oldcolor.b != newcolor.b){
            // delete old colored variants aswell
            if(coloredAssetVariants[object.id]){
                for (var prop in coloredAssetVariants[object.id]) {
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
            asset: colorize(getAsset(object.asset), object.color.r, object.color.g, object.color.b),
            color: object.color,
        };
    }

    return coloredAssets[object.id].asset;
}

export function getAssetVariant(asset, varient, varientrgb){
    const assetObj = getAsset(asset);
    if(!assetVariants[asset]){
        assetVariants[asset] = {};
    }
    if(!assetVariants[asset][varient]){
        assetVariants[asset][varient] = colorize(assetObj, varientrgb.r, varientrgb.g, varientrgb.b);
    }
    return assetVariants[asset][varient];
}

export function getColoredAssetVariant(object, varient, varientrgb){
    const coloredAsset = getColoredAsset(object);
    if(!coloredAssetVariants[object.id]){
        coloredAssetVariants[object.id] = {};
    }
    if(!coloredAssetVariants[object.id][varient]){
        coloredAssetVariants[object.id][varient] = colorize(coloredAsset, varientrgb.r, varientrgb.g, varientrgb.b);
    }
    return coloredAssetVariants[object.id][varient];
}

function colorize(image, r, g, b){
    const imageWidth = image.width;
    const imageHeight = image.height;

    const offscreen = new OffscreenCanvas(imageWidth, imageHeight);
    const ctx = offscreen.getContext("2d");

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

    for(let i = 0; i < imageData.data.length; i += 4){
        imageData.data[i + 0] *= r;
        imageData.data[i + 1] *= g;
        imageData.data[i + 2] *= b;
    }

    ctx.putImageData(imageData, 0, 0);

    return offscreen;
}

// #endregion