module.exports = Object.freeze({
    // player related
    PLAYER_SCALE: .55,
    PLAYER_SPEED: 3,
    PLAYER_FIRE_COOLDOWN: 1,
    PLAYER_USERNAME_HEIGHT: 45,

    // update related
    CLIENT_UPDATE_RATE: 50,
    SERVER_UPDATE_RATE: 50,

    // render related
    RENDER_DELAY: 100,
    HEIGHT_TO_CELL_RATIO: 11, // controls how zoomed the client is
    TEXT_FONT: "32px Verdana",
    BACKGROUND_SCALE: 24,
    BACKGROUND_PADDING: 1,

    // map related
    WORLD_SIZE: 4, // how many chunks wide and tall the world is
    CHUNK_SIZE: 32,
    CELLS_HORIZONTAL: 28,
    CELLS_VERTICAL: 16,
    SPAWN_SIZE: 2, // how many chunks wide and tall the spawn region is

    // message types
    MSG_TYPES: {
        JOIN_GAME: 'join_game',
        LEAVE_GAME: 'disconnect',
        PLAYER_INSTANTIATED: 'instantiated',
        GAME_UPDATE: 'update',
        INPUT: 'input',
        SHOOT: 'shoot',
        DEAD: 'dead',
    },

    // assets
    ASSETS: {
        MISSING_TEXTURE: 'MissingTexture.png',
        PLAYER: 'BlonktoPlayer.png',
        TILE: 'Tile.png',
        GRASS_TILE: 'GrassTile.png',
        SPACE_BG: 'SpaceBg.png',
    },
});