import { SerializedWriteItemStack } from "../items/serializedItemStack.js";
import { SerializedUpdateGameObject, SerializedWriteGameObject } from "./serializedGameObject.js";

/** Defines the format for serialized updates of a dropped stack */
export type SerializedUpdateDroppedStack = SerializedUpdateGameObject & {};

/** Defines the format for serialized writes of a dropped stack */
export type SerializedWriteDroppedStack = SerializedWriteGameObject & {
    type: string,
    itemStack: SerializedWriteItemStack,
    despawntime: number,
};
