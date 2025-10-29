/** Defines the format for serialized updates of the tab list */
export type SerializedTab = SerializedTabEntry[];

/** Defines the format for serialized updates of an entry in the tab list */
export type SerializedTabEntry = {
    username: string,
    kills?: number,
};
