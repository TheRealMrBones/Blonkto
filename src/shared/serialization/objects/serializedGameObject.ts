/** Defines the format for serialized updates of a game object */
export type SerializedUpdateGameObject = {
    static: {
        id: string,
        asset: string,
        falling: boolean,
    },
    dynamic: {
        x: number,
        y: number,
        dir: number,
        scale: number,
    },
};

/** Defines the format for serialized writes of a game object */
export type SerializedWriteGameObject = {
    x: number,
    y: number,
    dir: number,
    scale: number,
    falling: boolean,
};
