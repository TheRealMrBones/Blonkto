/** Defines the format for serialized updates of a ceiling */
export type SerializedUpdateCeiling = object;

/** Defines the format for serialized writes of a ceiling */
export type SerializedWriteCeiling = {
    ceilingdefinition: string,
    componentdata?: any,
};

/** Defines the format for serialized inits of a ceiling */
export type SerializedInitCeiling = {
    name: string,
    asset: string,
};
