import { OneTimeMessageContent } from "./oneTimeMessageContentTypes.js";
import { SerializedChangesInventory } from "./serialization/items/serializedInventory.js";
import { SerializedStation } from "./serialization/items/serializedStation.js";
import { SerializedUpdateGameObject } from "./serialization/objects/serializedGameObject.js";
import { SerializedUpdatePlayer } from "./serialization/objects/serializedPlayer.js";
import { SerializedTab } from "./serialization/serializedTab.js";
import { SerializedWorldLoad } from "./serialization/world/SerializedWorldLoad.js";
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
    me: SerializedUpdatePlayer;
    others: SerializedUpdatePlayer[];
    entities: SerializedUpdateGameObject[];
    inventoryupdates: SerializedChangesInventory;
    stationupdates: SerializedStation | null;
    worldLoad: SerializedWorldLoad;
    tab: SerializedTab;
    darkness?: number;
    tps: number;
    statereset: boolean;
    onetimemessages: OneTimeMessageContent[];
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
