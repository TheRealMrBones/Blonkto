module.exports = Object.freeze({
    PLAYER_SCALE: 19,
    PLAYER_SPEED: 300,
    PLAYER_FIRE_COOLDOWN: 1,

    UPDATE_RATE: 30,

    NATIVE_RESOLUTION: 1080,

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