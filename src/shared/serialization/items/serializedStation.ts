import { SerializedChangesInventory, SerializedUpdateInventory } from "./serializedInventory.js";

/** Defines the format for serialized updates of a station */
export type SerializedStation = {
    name: string,
    isnew: boolean,
    updates?: SerializedUpdateInventory[] | SerializedChangesInventory[],
};
