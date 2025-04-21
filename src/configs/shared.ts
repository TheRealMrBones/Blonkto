/** Definition for the shared configuration schema */
type SharedConfigSchema = {
    UPDATES: {
        FAKE_PING: number,
    },
    PLAYER: {
        PLAYER_SCALE: number,
        PLAYER_SPEED: number,
    },
    ATTACK: {
        ATTACK_DELAY: number,
        ATTACK_HITBOX_WIDTH: number,
        ATTACK_HITBOX_OFFSET: number,
        SWING_RENDER_DELAY: number,
        HIT_RENDER_DELAY: number,
    },
    WORLD: {
        WORLD_SIZE: number,
        CHUNK_SIZE: number,
        CELLS_HORIZONTAL: number,
        CELLS_VERTICAL: number,
    },
    INVENTORY: {
        INVENTORY_SIZE: number,
    },
    TAB: {
        SHOW_TAB: boolean,
        KILLS_TAB: boolean,
    },
};

// Initialize configuration with defaults then read saved after

/** Configurable settings used by both the client and server (Managed by the server) */
const SharedConfig: SharedConfigSchema = {
    UPDATES: {
        FAKE_PING: 0,
    },
    PLAYER: {
        PLAYER_SCALE: 0.55,
        PLAYER_SPEED: 3,
    },
    ATTACK: {
        ATTACK_DELAY: 0.7,
        ATTACK_HITBOX_WIDTH: 1,
        ATTACK_HITBOX_OFFSET: 0.5,
        SWING_RENDER_DELAY: 0.2,
        HIT_RENDER_DELAY: 0.5,
    },
    WORLD: {
        WORLD_SIZE: 6,
        CHUNK_SIZE: 32,
        CELLS_HORIZONTAL: 34,
        CELLS_VERTICAL: 20,
    },
    INVENTORY: {
        INVENTORY_SIZE: 36,
    },
    TAB: {
        SHOW_TAB: true,
        KILLS_TAB: true,
    },
};

// freeze and export config
export default Object.freeze(SharedConfig);