import { SerializedUpdateItemStack, SerializedWriteItemStack } from "./serializedItemStack.js";

/** Defines the format for serialized updates of an inventory */
export type SerializedUpdateInventory = (SerializedUpdateItemStack | null)[];

/** Defines the format for serialized changes of an inventory */
export type SerializedChangesInventory = SerializedChangesSlot[];

/** Defines the format for serialized changes of an inventory slot */
export type SerializedChangesSlot = {
    slot: number,
    itemstack: SerializedUpdateItemStack | null,
};

/** Defines the format for serialized writes of an inventory */
export type SerializedWriteInventory = {
    slots: (SerializedWriteItemStack | null)[];
};
