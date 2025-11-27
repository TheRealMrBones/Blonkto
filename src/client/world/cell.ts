import { SerializedInitBlock } from "shared/serialization/world/serializedBlock.js";
import { SerializedInitCeiling } from "shared/serialization/world/serializedCeiling.js";
import { SerializedInitFloor } from "shared/serialization/world/serializedFloor.js";

/** The data of a cell saved in the client world */
export type Cell = {
    block?: SerializedInitBlock;
    floor?: SerializedInitFloor;
    ceiling?: SerializedInitCeiling;
    animated: boolean;
};
