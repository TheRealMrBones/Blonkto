const Constants = require('../shared/constants');

// #region collision checks

exports.attackHitCheck = (player, players, attackdir, damage) => {
    const attackpos = {
        x: player.x + Math.sin(attackdir) * Constants.ATTACK_HITBOX_OFFSET,
        y: player.y + Math.cos(attackdir) * Constants.ATTACK_HITBOX_OFFSET,
    };

    for(let i = 0; i < players.length; i++){
        const player2 = players[i];
        const dist = getDistance(attackpos, player2);
        const realdist = dist - (Constants.PLAYER_SCALE + Constants.ATTACK_HITBOX_WIDTH) / 2;
        if(player2.id != player.id && realdist < 0){
            if(player2.takeHit(damage)){
                player2.dead = true;
                player2.killedby = player.username;
            }
        }
    }
}

// #endregion

// #region helpers

function getDistance(object1, object2){
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// #endregion