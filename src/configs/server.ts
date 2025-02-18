import fs from "fs";

/** Definition for the server configuration schema */
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

// Initialize configuration with defaults then read saved after

/** Configurable settings used by the server */
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

// read config json if exists
if(!fs.existsSync("./configs")){
    fs.mkdirSync("./configs");
}

if(fs.existsSync("./configs/server.json")){
    const savedConfig: ServerConfigSchema = JSON.parse(fs.readFileSync("./configs/server.json", "utf8"));
    traverse(savedConfig, ServerConfig);
}

/** Recursive return for all values from saved data */
function traverse(lastrefold: any, lastrefnew: any) {
    Object.keys(lastrefold).forEach(key => {
        if(key in lastrefnew){
            if (typeof lastrefold[key] === "object") {
                traverse(lastrefold[key], lastrefnew[key]);
            } else {
                lastrefnew[key] = lastrefold[key];
            }
        }
    });
}

// write new config to configs
fs.writeFileSync("./configs/server.json", JSON.stringify(ServerConfig, null, 2));

// freeze and export config
export default Object.freeze(ServerConfig);