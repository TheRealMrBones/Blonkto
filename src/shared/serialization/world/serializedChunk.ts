import { SerializedLoadCell } from "./serializedCell.js";

/** Defines the format for serialized loads of a chunk */
export type SerializedLoadChunk = {
    x: number,
    y: number,
    cells: SerializedLoadCell[][],
};

/** Defines the format for serialized loads of a chunk with used markers */
export type SerializedLoadChunkFull = SerializedLoadChunk & {
    usedblocks: string[],
    usedfloors: string[],
    usedceilings: string[],
};

/** Defines the format for serialized writes of a chunk */
export type SerializedWriteChunk = string;
