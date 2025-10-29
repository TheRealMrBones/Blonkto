/** Defines the format for serialized updates of an item stack */
export type SerializedUpdateItemStack = {
    displayname: string,
    name: string,
    asset: string,
    amount: number,
};

/** Defines the format for serialized writes of an item stack */
export type SerializedWriteItemStack = {
    name: string,
    amount: number,
    componentdata?: { [key: string]: any },
};
