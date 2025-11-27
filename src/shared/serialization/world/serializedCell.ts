import { SerializedUpdateBlock, SerializedWriteBlock } from "shared/serialization/world/serializedBlock.js";
import { SerializedUpdateCeiling, SerializedWriteCeiling } from "shared/serialization/world/serializedCeiling.js";
import { SerializedUpdateFloor, SerializedWriteFloor } from "shared/serialization/world/serializedFloor.js";

/** Defines the format for serialized loads of a cell */
export type SerializedLoadCell = {
    block?: string,
    floor?: string,
    ceiling?: string,
    blockupdate?: SerializedUpdateBlock,
    floorupdate?: SerializedUpdateFloor,
    ceilingupdate?: SerializedUpdateCeiling,
};

/** Defines the format for serialized writes of a cell */
export type SerializedWriteCell = {
    basefloor?: string,
    block?: SerializedWriteBlock,
    floor?: SerializedWriteFloor,
    ceiling?: SerializedWriteCeiling,
};
