const Constants = require('../shared/constants.js');
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
const coloredAssetVariants = {};

export function getColoredAsset(object){
    if(!coloredAssets[object.id]){
        coloredAssets[object.id] = colorize(getAsset(object.asset), object.color.r, object.color.g, object.color.b);
    }
    return coloredAssets[object.id];
}

export function getColoredAssetVariant(object, varient, varientrgb){
    const coloredAsset = getColoredAsset(object);
    if(!coloredAssetVariants[object.id]){
        coloredAssetVariants[object.id] = {};
    }
    if(!coloredAssetVariants[object.id][varient]){
        coloredAssetVariants[object.id][varient] = colorize(coloredAssets[object.id], varientrgb.r, varientrgb.g, varientrgb.b);
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