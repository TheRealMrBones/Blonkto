import { SerializedInitBlock } from "shared/serialization/world/serializedBlock.js";
import { SerializedInitCeiling } from "shared/serialization/world/serializedCeiling.js";
import { SerializedLoadCell } from "shared/serialization/world/serializedCell.js";
import { SerializedLoadChunk } from "shared/serialization/world/serializedChunk.js";
import { SerializedInitFloor } from "shared/serialization/world/serializedFloor.js";
import { Vector2D } from "shared/types.js";

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
    data: SerializedLoadCell,
};
