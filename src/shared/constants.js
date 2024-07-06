module.exports = Object.freeze({
    // player related
    FILTER_USERNAME: false,
    PLAYER_SCALE: .55,
    PLAYER_SPEED: 3,
    PLAYER_CLICK_COOLDOWN: .1,

    // update related
    CLIENT_UPDATE_RATE: 50,
    SERVER_UPDATE_RATE: 50,

    // render related
    RENDER_DELAY: 100,
    HEIGHT_TO_CELL_RATIO: 11, // controls how zoomed the client is
    TEXT_FONT: "Verdana",
    BACKGROUND_SCALE: 24,
    BACKGROUND_PADDING: 1,
    USERNAME_SCALE: .3,
    USERNAME_HANG: .5,

    // map related
    WORLD_SIZE: 6, // how many chunks wide and tall the world is
    CHUNK_SIZE: 32,
    CELLS_HORIZONTAL: 28,
    CELLS_VERTICAL: 16,
    SPAWN_SIZE: 2, // how many chunks wide and tall the spawn region is

    // chat
    FILTER_CHAT: false,
    MESSAGE_TIME: 10,

    // message types
    MSG_TYPES: {
        JOIN_GAME: 'join_game',
        LEAVE_GAME: 'disconnect',
        PLAYER_INSTANTIATED: 'instantiated',
        GAME_UPDATE: 'update',
        INPUT: 'input',
        CLICK: 'click',
        INTERACT: 'interact',
        DEAD: 'dead',
        SEND_MESSAGE: 'send',
        RECEIVE_MESSAGE: 'receive',
    },

    // assets
    ASSETS: {
        MISSING_TEXTURE: 'MissingTexture.png',
        PLAYER: 'BlonktoPlayer.png',
        TILE: 'Tile.png',
        GRASS_FLOOR: 'GrassFloor.png',
        SPACE_BG: 'SpaceBg.png',
        STONE_BLOCK: 'StoneBlock.png',
    },

    // block shapes
    SHAPES: {
        NONE: 0,
        SQUARE: 1,
        CIRCLE: 2,
    },
});