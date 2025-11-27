import { Color } from "shared/types.js";

/** The data format of game assets */
export type AssetCache = {
    image: OffscreenCanvas,
    scale: number,
    color: Color,
};
