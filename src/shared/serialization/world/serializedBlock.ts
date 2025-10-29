/** Defines the format for serialized updates of a block */
export type SerializedUpdateBlock = {};

/** Defines the format for serialized writes of a block */
export type SerializedWriteBlock = {
    blockdefinition: string,
    componentdata?: any,
};

/** Defines the format for serialized inits of a block */
export type SerializedInitBlock = {
    name: string,
    asset: string,
    scale: number,
    shape: number,
    floorvisible: boolean,
    walkthrough: boolean,
    underentities: boolean,
};
