const Constants = require('../shared/constants.js');
const { ASSETS } = Constants;

const assets = {};

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