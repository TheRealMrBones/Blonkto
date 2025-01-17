module.exports = Object.freeze({
    // #region server
    OP_PASSCODE: true,
    OP_PASSCODE_WHEN_OPS: false,
    // #endregion

    // #region player
    FILTER_USERNAME: false,
    PLAYER_SCALE: .55,
    PLAYER_SPEED: 3,
    ALLOW_CHANGE_NAME: false,
    RACISM: .3,
    RACISM_PERM: true,
    // #endregion

    // #region object
    FALL_RATE: .5,
    // #endregion

    // #region attack hitbox
    ATTACK_DELAY: .7,
    ATTACK_HITBOX_WIDTH: 1,
    ATTACK_HITBOX_OFFSET: .5,
    SWING_RENDER_DELAY: .2,
    HIT_RENDER_DELAY: .5,
    // #endregion

    // #region update related
    CLIENT_UPDATE_RATE: 50,
    SERVER_UPDATE_RATE: 50,
    // #endregion

    // #region render related
    RENDER_DELAY: 100,
    HEIGHT_TO_CELL_RATIO: 11, // controls how zoomed the client is
    TEXT_FONT: "Verdana",
    BACKGROUND_SCALE: 24,
    BACKGROUND_PADDING: 1,
    USERNAME_SCALE: .3,
    USERNAME_HANG: .5,
    // #endregion

    // #region map related
    WORLD_SIZE: 6, // how many chunks wide and tall the world is
    CHUNK_SIZE: 32,
    CELLS_HORIZONTAL: 28,
    CELLS_VERTICAL: 16,
    SPAWN_SIZE: 2, // how many chunks wide and tall the spawn region is
    CHUNK_UNLOAD_RATE: 1.0,
    AUTOSAVE_RATE: 60.0,
    // #endregion

    // #region chat
    FILTER_CHAT: false,
    MESSAGE_TIME: 10,
    MAX_MESSAGE_COUNT: 20,
    // #endregion

    // #region message types
    MSG_TYPES: {
        CREATE_ACCOUNT: "create_account",
        LOGIN: "login",
        JOIN_GAME: 'join_game',
        CONNECTION_REFUSED: 'connection_refused',
        DISCONNECT: 'disconnect',
        PLAYER_INSTANTIATED: 'instantiated',
        GAME_UPDATE: 'update',
        INPUT: 'input',
        CLICK: 'click',
        INTERACT: 'interact',
        DEAD: 'dead',
        SEND_MESSAGE: 'send',
        RECEIVE_MESSAGE: 'receive',
        KICK: 'kick',
        BAN: 'ban',
    },
    // #endregion

    // #region assets
    ASSETS: {
        MISSING_TEXTURE: 'MissingTexture.png',
        PLAYER: 'BlonktoPlayer.png',
        TILE: 'Tile.png',
        GRASS_FLOOR: 'GrassFloor.png',
        SPACE_BG: 'SpaceBg.png',
        STONE_BLOCK: 'StoneBlock.png',
        PIG: 'Pig.png',
    },

    HIT_COLOR: {r: 1, g: .5, b: .5},
    // #endregion

    // #region block shapes
    SHAPES: {
        NONE: 0,
        SQUARE: 1,
        CIRCLE: 2,
    },
    // #endregion

    // #region commands
    COMMAND_ARGUMENTS: {
        KEY: 0,
        PLAYER: 1,
        STRING: 2,
        INT: 3,
        FLOAT: 4,
    },
    // #endregion
});