import { Color } from "../../types.js";
import { SerializedWriteInventory } from "../items/serializedInventory.js";
import { SerializedUpdateEntity, SerializedWriteEntity } from "./serializedEntity.js";

/** Defines the format for serialized updates of a player */
export type SerializedUpdatePlayer = SerializedUpdateEntity & {
    static: {
        lastupdated: number,
        username: string,
        color: Color,
        kills: number,
    },
};

/** Defines the format for serialized writes of a player */
export type SerializedWritePlayer = SerializedWriteEntity & {
    dead: false,
    username: string,
    gamemode: string,
    layer: number,
    kills: number,
    color: Color,
    inventory: SerializedWriteInventory,
};

/** Defines the format for serialized writes of a dead player */
export type SerializedWriteDeadPlayer = {
    dead: true,
    username: string,
    gamemode: string,
    kills: number,
    color: Color,
    inventory?: SerializedWriteInventory,
};
