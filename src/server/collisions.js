const Constants = require('../shared/constants');

exports.moveTouchingPlayers = (player, players, map) => {
    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = player.distanceTo(player2);
        const realdist = dist - (Constants.NATIVE_RESOLUTION / Constants.PLAYER_SCALE + Constants.NATIVE_RESOLUTION / Constants.PLAYER_SCALE) / 2;
        if(player2.id != player.id && realdist < 0){
            if(dist == 0){
                player.x += realdist / 2;
                player2.x -= realdist / 2;
            }else{
                let dir = Math.atan2(player.x - player2.x, player2.y - player.y);
                player.x += Math.sin(dir) * realdist / 2;
                player.y -= Math.cos(dir) * realdist / 2;
                player2.x -= Math.sin(dir) * realdist / 2;
                player2.y += Math.cos(dir) * realdist / 2;
                // dont forget to re addd wall push check after player push check here!

                player.push(-Math.sin(dir) * realdist / 2, Math.cos(dir) * realdist / 2);
                player2.push(Math.sin(dir) * realdist / 2, -Math.cos(dir) * realdist / 2);
            }
        }
    }
}