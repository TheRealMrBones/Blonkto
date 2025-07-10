import { Color } from "./types.js";

/** Defines the format of the failed connection / kicked messages */
export type FailedConnectionContent = {
    reason: string;
    extra: string;
};

/** Defines the format of the join game messages */
export type JoinGameContent = {
    token: string;
};

/** Defines the format of the player instantiated message */
export type PlayerInstantiatedContent = {
    x: number;
    y: number;
    color: Color;
};

/** Defines the format of the game update message */
export type GameUpdateContent = {
    t: number;
    lastupdatetime: number | null;
    me: any;
    fixes: any;
    inventoryupdates: any[];
    stationupdates: any | null;
    recipes: any[];
    others: any[];
    entities: any[];
    worldLoad: any
    tab: any[];
    darkness: number;
    tps: number;
};

/** Defines the format of the input message */
export type InputContent = {
    t: number;
    lastupdatetime: number | null;
    lastserverupdate: number;
    dir: number;
    dx: number;
    dy: number;
    hotbarslot: number;
};

/** Defines the format of the click and interact message */
export type ClickContent = {
    xoffset: number;
    yoffset: number;
    mex: number;
    mey: number;
};

/** Defines the format of the drop message */
export type DropContent = {
    slot: number;
    all: boolean;
};

/** Defines the format of the swap message */
export type SwapContent = {
    slot1: number;
    slot2: number;
};

/** Defines the format of the craft message */
export type CraftContent = {
    result: string;
    ingredients: { [item: string]: number };
    amount: number;
};

/** Defines the format of the send message message */
export type SendMessageContent = {
    text: string;
};

/** Defines the format of the receive message message */
export type ReceiveMessageContent = {
    text: string;
    id: string;
};