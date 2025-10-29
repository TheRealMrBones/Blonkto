import PlayerClient from "../playerClient.js";
import { AssetCache } from "./assetCache.js";
import { equalColor, getBaseColor } from "../../shared/typeOperations.js";
import { Color } from "../../shared/types.js";
import { AnimationData, AnimationDefinition } from "./animationData.js";

import Constants from "../../shared/constants.js";
const { ASSETS, ANIMATIONS } = Constants;

/** Manages assets loaded by the client for later rendering */
class AssetManager {
    private readonly playerclient: PlayerClient;

    private readonly assetsbase: {[key: string]: OffscreenCanvas} = {};
    private readonly assetscache: {[key: string]: AssetCache[] } = {};

    private readonly animations: {[key: string]: AnimationDefinition} = {};

    private readonly downloadPromise: Promise<void[]> = Promise.all([
        ...Object.values(ASSETS).map(this.downloadAsset.bind(this)),
        ...Object.values(ANIMATIONS).map(this.downloadAnimation.bind(this)),
    ]);

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    // #region general management

    /** Prepares all of the assets the client would be using in the game */
    downloadAssets = (): Promise<void[]> => this.downloadPromise;

    // #endregion

    // #region asset management

    /** Prepares an individual asset and loads it into memory */
    private downloadAsset(assetName: string): Promise<void> {
        return new Promise<void>(resolve => {
            const assetimage = new Image();
            assetimage.onload = () => {
                const asset = new OffscreenCanvas(assetimage.width, assetimage.height);
                const ctx = asset.getContext("2d")!;
                ctx.drawImage(assetimage, 0, 0);

                this.assetsbase[assetName] = asset;
                resolve();
            };
            assetimage.src = `/assets/${assetName}.png`;
        });
    }

    /** Returns the image asset with the given name */
    getAsset(assetname: string, scale: number, color?: Color, scaleheight?: boolean): CanvasImageSource | null {
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

    // #region animation management

    /** Prepares an individual animation set and loads it into memory */
    private downloadAnimation(animationName: string): Promise<void> {
        return new Promise<void>(resolve => {
            this.readJsonFile(`/animations/${animationName}.json`).then(data => {
                const spritesheet = new Image();
                spritesheet.onload = () => {
                    this.downloadAnimationFrames(spritesheet, data);
                    this.downloadAnimationDefinitions(data);
                    resolve();
                };
                spritesheet.src = `/animations/${animationName}.png`;
            });
        });
    }

    /** Adds each animation frame from the given animation data and spritesheet to assetsbase */
    private downloadAnimationFrames(spritesheet: HTMLImageElement, data: AnimationData): void {
        const framewidth = spritesheet.width / data.spritesheetwidth;
        const frameheight = spritesheet.height / data.spritesheetheight;

        for(let x = 0; x < data.spritesheetwidth; x++){
            for(let y = 0; y < data.spritesheetheight; y++){
                const asset = new OffscreenCanvas(framewidth, frameheight);
                const ctx = asset.getContext("2d")!;
                ctx.drawImage(asset, -x * framewidth, -y * frameheight);

                this.assetsbase[`${data.name}_${x + y * data.spritesheetwidth}`] = asset;
            }
        }
    }

    /** Adds each animation definition from the given animation data to the  */
    private downloadAnimationDefinitions(data: AnimationData): void {
        for(const animation of data.animations){
            const animationname = animation.name == data.name ? data.name : `${data.name}_${animation.name}`;
            this.animations[animationname] = animation;
        }
    }

    /** Returns the image asset for the given time in the given animation */
    getAnimationAsset(animationname: string, time: number, scale: number, color?: Color, scaleheight?: boolean): CanvasImageSource | null {
        if(animationname === undefined) return null;
        
        const spritesheet = animationname.split("_")[0];
        const animation = this.animations[animationname];
        time %= animation.duration;

        let frametime = 0;

        for(const frame of animation.frames){
            if(frametime <= time && frametime + frame.duration > time){
                const assetname = `${spritesheet}_${frame.sprite}`
                return this.getAsset(assetname, scale, color, scaleheight);
            }

            frametime += frame.duration;
        }

        return null;
    }

    // #endregion

    // #region helpers

    /** Returns an object with the data from the given json file */
    async readJsonFile(path: string): Promise<any | null> {
        try{
            const response = await fetch(path);
            if(!response.ok){
                console.error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }catch(error){
            console.error("Error reading JSON file:", error);
            return null;
        }
    }

    // #endregion
}

export default AssetManager;
