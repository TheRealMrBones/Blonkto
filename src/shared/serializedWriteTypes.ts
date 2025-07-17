/** Defines the format for serialized writes of an item stack */
export type SerializedWriteItemStack = {
    name: string,
    amount: number,
    componentdata?: any,
};

/** Defines the format for serialized writes of a block */
export type SerializedWriteBlock = {
    blockdefinition: string,
    componentdata?: any,
};

/** Defines the format for serialized writes of a floor */
export type SerializedWriteFloor = {
    floordefinition: string,
    componentdata?: any,
};

/** Defines the format for serialized writes of a ceiling */
export type SerializedWriteCeiling = {
    ceilingdefinition: string,
    componentdata?: any,
};
