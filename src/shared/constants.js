module.exports = Object.freeze({
    // player related
    PLAYER_SCALE: 19,
    PLAYER_SPEED: 300,
    PLAYER_FIRE_COOLDOWN: 1,
    PLAYER_USERNAME_HEIGHT: 45,

    // update related
    UPDATE_RATE: 40,

    // render related
    NATIVE_RESOLUTION: 1080,
    TEXT_FONT: "32px Verdana",

    // map related
    REGION_SIZE: 10,
    CELL_SIZE: 11,

    // message types
    MSG_TYPES: {
        JOIN_GAME: 'join_game',
        LEAVE_GAME: 'disconnect',
        PLAYER_INSTANTIATED: 'instantiated',
        GAME_UPDATE: 'update',
        INPUT: 'input',
        FIX_POS: 'fixpos',
        SHOOT: 'shoot',
        DEAD: 'dead',
    },
});