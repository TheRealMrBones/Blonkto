import { Color, Vector2D } from "./types.js";

// #region base one time message

/** Returns a new one time message of the requested type */
export function createOneTimeMessage<T>(type: string, value: T): OneTimeMessageContent {
    return {
        type: type,
        value: value,
    };
}

/** Defines the format for the one time message wrapper */
export type OneTimeMessageContent = {
    type: string;
    value: any;
};

// #endregion

// #region player updates

/** Defines the format of the push one time message */
export type PushContent = {
    pushx: number;
    pushy: number;
};

/** Defines the format of the set pos one time message */
export type SetPosContent = {
    pos: Vector2D;
};

/** Defines the format of the set gamemode one time message */
export type SetGamemodeContent = {
    gamemode: string;
};

/** Defines the format of the set color one time message */
export type SetColorContent = {
    color: Color;
};

// #endregion

// #region game updates

/** Defines the format of the set color one time message */
export type RecipesContent = {
    recipes: any[];
};

/** Defines the format of the set darkness one time message */
export type DarknessContent = {
    darkness: number;
};

// #endregion
