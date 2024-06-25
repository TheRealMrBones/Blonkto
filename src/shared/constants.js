module.exports = Object.freeze({
    // player related
    PLAYER_SCALE: 19,
    PLAYER_SPEED: 300,
    PLAYER_FIRE_COOLDOWN: 1,
    PLAYER_USERNAME_HEIGHT: 45,

    // update related
    CLIENT_UPDATE_RATE: 50,
    SERVER_UPDATE_RATE: 40,

    // render related
    RENDER_DELAY: 100,
    NATIVE_RESOLUTION: 1080,
    TEXT_FONT: "32px Verdana",

    // map related
    WORLD_SIZE: 2, // how many chunks wide and tall the world is
    CHUNK_SIZE: 32,
    CELL_SCALE: 11,
    CELLS_HORIZONTAL: 28,
    CELLS_VERTICAL: 16,

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
        PLAYER: 'BlonktoPlayer.png',
        TILE: 'Tile.png',
    },
});