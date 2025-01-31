// define schema
type ServerConfigSchema = {
    OP_PASSCODE: {
        OP_PASSCODE: boolean,
        OP_PASSCODE_WHEN_OPS: boolean
    },
    PLAYER: {
        FILTER_USERNAME: boolean,
        ALLOW_CHANGE_NAME: boolean,
        RACISM: number,
        RACISM_PERM: boolean
    },
    OBJECT: {
        FALL_RATE: number
    },
    UPDATE: {
        SERVER_UPDATE_RATE: number
    },
    WORLD: {
        SPAWN_SIZE: number,
        CHUNK_UNLOAD_RATE: number,
        AUTOSAVE_RATE: number
    },
    CHAT: {
        FILTER_CHAT: boolean
    }
};

// define default values
const ServerConfig: ServerConfigSchema = {
    OP_PASSCODE: {
        OP_PASSCODE: true,
        OP_PASSCODE_WHEN_OPS: false
    },
    PLAYER: {
        FILTER_USERNAME: false,
        ALLOW_CHANGE_NAME: false,
        RACISM: 0.3,
        RACISM_PERM: true
    },
    OBJECT: {
        FALL_RATE: 0.5
    },
    UPDATE: {
        SERVER_UPDATE_RATE: 50
    },
    WORLD: {
        SPAWN_SIZE: 2,
        CHUNK_UNLOAD_RATE: 1.0,
        AUTOSAVE_RATE: 60.0
    },
    CHAT: {
        FILTER_CHAT: false
    }
};

// freeze and export config
module.exports = Object.freeze(ServerConfig);