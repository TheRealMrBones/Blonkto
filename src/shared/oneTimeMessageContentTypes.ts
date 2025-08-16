import { Color, Pos } from "./types.js";

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

/** Defines the format of the push one time message */
export type PushContent = {
    pushx: number;
    pushy: number;
};

/** Defines the format of the set pos one time message */
export type SetPosContent = {
    pos: Pos;
};

/** Defines the format of the set gamemode one time message */
export type SetGamemodeContent = {
    gamemode: string;
};

/** Defines the format of the set color one time message */
export type SetColorContent = {
    color: Color;
};
