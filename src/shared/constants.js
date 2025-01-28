module.exports = Object.freeze({
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

    ASSETS: {
        MISSING_TEXTURE: 'MissingTexture.png',
        PLAYER: 'BlonktoPlayer.png',
        TILE: 'Tile.png',
        GRASS_FLOOR: 'GrassFloor.png',
        SPACE_BG: 'SpaceBg.png',
        STONE_BLOCK: 'StoneBlock.png',
        PIG: 'Pig.png',
    },

    SHAPES: {
        NONE: 0,
        SQUARE: 1,
        CIRCLE: 2,
    },

    COMMAND_ARGUMENTS: {
        KEY: 0,
        PLAYER: 1,
        STRING: 2,
        INT: 3,
        FLOAT: 4,
        BOOLEAN: 5,
    },
});