import { SerializedUpdateGameObject, SerializedWriteGameObject } from "./serializedGameObject.js";

/** Defines the format for serialized updates of an entity */
export type SerializedUpdateEntity = SerializedUpdateGameObject & {
    static: {
        health: number,
        hit: boolean,
        swinging: boolean,
        swingdir: number,
    },
};

/** Defines the format for serialized writes of an entity */
export type SerializedWriteEntity = SerializedWriteGameObject & {
    health: number,
};
