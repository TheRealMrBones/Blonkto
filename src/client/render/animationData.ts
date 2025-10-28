/** The data format for animation json data */
export type AnimationData = {
    name: string;
    spritesheetwidth: number;
    spritesheetheight: number;
    animations: AnimationDefinition[];
}

/** The data format for a single animation definition */
export type AnimationDefinition = {
    name: string;
    duration: number;
    frames: AnimationFrame[];
}

/** The data format for a single animation frame */
export type AnimationFrame = {
    sprite: number;
    duration: number;
}
