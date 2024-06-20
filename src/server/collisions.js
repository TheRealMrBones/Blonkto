const Constants = require('../shared/constants');

exports.moveTouchingPlayers = (player, players, map) => {
    for (let i = 0; i < players.length; i++) {
        const player2 = players[i];
        let dist = player.distanceTo(player2);
        if (
            player2.id != player.id &&
            dist <= (Constants.NATIVE_RESOLUTION / Constants.PLAYER_SCALE + Constants.NATIVE_RESOLUTION / Constants.PLAYER_SCALE) / 2
        ) {
            if(dist == 0){
                player.x += dist / 4;
                player2.x -= dist / 4;
            }else{
                let dir = Math.atan2(player.x - player2.x, player2.y - player.y);
                player.x += Math.sin(dir) * dist / 4;
                player.y -= Math.cos(dir) * dist / 4;
                player2.x -= Math.sin(dir) * dist / 4;
                player2.y += Math.cos(dir) * dist / 4;
                PhaseCheck(player, map.getMap(player.x, player.y));
                PhaseCheck(player2, map.getMap(player2.x, player2.y));
                player.socket.emit(Constants.MSG_TYPES.FIX_POS, {
                    newx: player.x,
                    newy: player.y,
                });
                player2.socket.emit(Constants.MSG_TYPES.FIX_POS, {
                    newx: player2.x,
                    newy: player2.y,
                });
            }
        }
    }
}