import { SerializedWriteBlock } from "./serializedBlock.js";
import { SerializedWriteCeiling } from "./serializedCeiling.js";
import { SerializedWriteFloor } from "./serializedFloor.js";

/** Defines the format for serialized loads of a cell */
export type SerializedLoadCell = {
    block?: string,
    floor?: string,
    ceiling?: string,
};

/** Defines the format for serialized writes of a cell */
export type SerializedWriteCell = {
    basefloor?: string,
    block?: SerializedWriteBlock,
    floor?: SerializedWriteFloor,
    ceiling?: SerializedWriteCeiling,
};
