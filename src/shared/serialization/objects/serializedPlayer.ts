import { SerializedWriteInventory } from "shared/serialization/items/serializedInventory.js";
import { SerializedUpdateEntity, SerializedWriteEntity } from "shared/serialization/objects/serializedEntity.js";
import { Color } from "shared/types.js";

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
