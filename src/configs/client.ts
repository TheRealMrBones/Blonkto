/** Definition for the client configuration schema */
type ClientConfigSchema = {
    ATTACK: {
        HIT_COLOR: {r: number, g: number, b: number},
    },
    UPDATE: {
        CLIENT_UPDATE_RATE: number,
        SERVER_RESYNC_THRESHOLD: number,
        CONNECTION_LOST_THRESHOLD: number,
    },
    RENDER: {
        RENDER_DELAY: number,
        RENDER_PADDING: number,
        TEXT_FONT: string,
        BACKGROUND_SCALE: number,
        USERNAME_SCALE: number,
        USERNAME_HANG: number,
    },
    CHAT: {
        MESSAGE_TIME: number,
        MAX_MESSAGE_COUNT: number,
    },
};

// Initialize configuration with defaults then read saved after

/** Configurable settings used by the client */
const ClientConfig: ClientConfigSchema = {
    ATTACK: {
        HIT_COLOR: {r: 1, g: 0.5, b: 0.5},
    },
    UPDATE: {
        CLIENT_UPDATE_RATE: 50,
        SERVER_RESYNC_THRESHOLD: 50,
        CONNECTION_LOST_THRESHOLD: 250,
    },
    RENDER: {
        RENDER_DELAY: 60,
        RENDER_PADDING: 5,
        TEXT_FONT: "Verdana",
        BACKGROUND_SCALE: 1.5,
        USERNAME_SCALE: 0.3,
        USERNAME_HANG: 0.5,
    },
    CHAT: {
        MESSAGE_TIME: 10,
        MAX_MESSAGE_COUNT: 20,
    },
};

// freeze and export config
export default Object.freeze(ClientConfig);
