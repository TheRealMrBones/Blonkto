/** Defines the format for serialized updates of a floor */
export type SerializedUpdateFloor = {};

/** Defines the format for serialized writes of a floor */
export type SerializedWriteFloor = {
    floordefinition: string,
    componentdata?: any,
};

/** Defines the format for serialized inits of a floor */
export type SerializedInitFloor = {
    name: string,
    asset: string,
};
