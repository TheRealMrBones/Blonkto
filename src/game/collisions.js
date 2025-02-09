import SharedConfig from '../configs/shared';
const { ATTACK_HITBOX_WIDTH, ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;
const { PLAYER_SCALE } = SharedConfig.PLAYER;

// #region collision checks

export const collectCheck = (player, collectables, game) => {
    for(let i = 0; i < collectables.length; i++){
        const collectable = collectables[i];
        const dist = getDistance(player, collectable);
        const realdist = dist - (PLAYER_SCALE + collectable.scale) / 2;
        if(realdist < 0){
            if (player.collectStack(collectable.itemStack)) game.removeObject(collectable.id);
        }
    }
}

export const itemMergeCheck = (collectable, collectables, game) => {
    for(let i = 0; i < collectables.length; i++){
        const collectable2 = collectables[i];
        const dist = getDistance(collectable, collectable2);
        const realdist = dist - (collectable.scale + collectable2.scale) / 2;
        if(collectable.id != collectable2.id && realdist < 0){
            if (collectable.itemStack.mergeStack(collectable2.itemStack)) game.removeObject(collectable2.id);
        }
    }
}

export const attackHitCheck = (player, entities, attackdir, damage) => {
    const attackpos = {
        x: player.x + Math.sin(attackdir) * ATTACK_HITBOX_OFFSET,
        y: player.y + Math.cos(attackdir) * ATTACK_HITBOX_OFFSET,
    };

    for(let i = 0; i < entities.length; i++){
        const entity = entities[i];
        const dist = getDistance(attackpos, entity);
        const realdist = dist - (PLAYER_SCALE + ATTACK_HITBOX_WIDTH) / 2;
        if(entity.id != player.id && realdist < 0){
            if(entity.takeHit(damage)){
                entity.dead = true;
                entity.killedby = player.username;
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