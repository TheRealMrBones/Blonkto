import { Vector2D } from "../../types.js";
import { SerializedInitBlock } from "./serializedBlock.js";
import { SerializedInitCeiling } from "./serializedCeiling.js";
import { SerializedLoadChunk } from "./serializedChunk.js";
import { SerializedInitFloor } from "./serializedFloor.js";

/** Defines the format for serialized loads of the game world for a player */
export type SerializedWorldLoad = {
    updatedcells: SerializedCellUpdate[],
    unloadChunks: Vector2D[],
    loadChunks: SerializedLoadChunk[],
    usedblocks: SerializedInitBlock[],
    usedfloors: SerializedInitFloor[],
    usedceilings: SerializedInitCeiling[],
};

/** Defines the format for serialized updates of a single world cell */
export type SerializedCellUpdate = {
    x: number,
    y: number,
    data: any,
};
