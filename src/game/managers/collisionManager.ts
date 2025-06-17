import Player from "../objects/player.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import Game from "../game.js";
import GameObject from "../objects/gameObject.js";
import { CollisionObject, CircleCollisionObject } from "../../shared/types.js";
import * as SharedCollisions from "../../shared/collision.js";

import SharedConfig from "../../configs/shared.js";
import NonplayerEntity from "../objects/nonplayerEntity.js";
const { ATTACK_HITBOX_WIDTH, ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;

/** Manages Collision detection for all elements in the game world */
class CollisionManager {
    private game: Game;

    constructor(game: Game){
        this.game = game;
    }

    /** Checks collisions between the given player and other nearby players */
    entityCollisions(entity: Entity): void {
        const entities = this.game.entityManager.getEntities();

        for(let i = 0; i < entities.length; i++){
            const entity2 = entities[i];

            const push = SharedCollisions.entityCollision(entity, { x: entity2.x, y: entity2.y, scale: entity2.scale });
            if(push === null) continue;
            entity.emitCollisionEvent(this.game, entity2, push);

            entity.push(push.x / 2, push.y / 2);
            entity2.push(-push.x / 2, -push.y / 2);
        }
    }

    /** Checks for non-player objects colliding on blocks */
    blockCollisions(object: GameObject): void {
        const meobject: CircleCollisionObject = object as CircleCollisionObject;
        
        const checkcells: CollisionObject[] = [];
        for(const cellpos of SharedCollisions.getCollisionCheckCells(meobject)){
            const cell = this.game.world.getCell(cellpos.x, cellpos.y, false);
            if(!cell) continue;
            const block = cell.block;
            if(block === null) continue;
            if(block.walkthrough) continue;

            const blockobject: CollisionObject = {
                shape: block.shape,
                scale: block.scale,
                x: cellpos.x,
                y: cellpos.y
            };
            checkcells.push(blockobject);
        }
    
        const push = SharedCollisions.blockCollisions(meobject, checkcells);
        object.push(push.x, push.y);
    };

    /** Checks for dropped stacks that the given player can pick up */
    collectCheck(player: Player): void {
        const collectables = this.game.entityManager.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable = collectables[i];
            const push = SharedCollisions.entityCollision(player, { x: collectable.x, y: collectable.y, scale: collectable.scale });
            const collided = (push !== null);

            let removeignore = (collectable.ignore != null);
            
            if(collided){
                if(collectable.ignore === player){
                    removeignore = false;
                    continue;
                }
                if(player.inventory.collectStack(collectable.itemStack)) this.game.entityManager.removeObject(collectable.id);
            }

            if(removeignore) collectable.ignore = null;
        }
    };

    /** Checks for dropped stacks that the given dropped stack can merge with */
    itemMergeCheck(collectable: DroppedStack): void {
        const collectables = this.game.entityManager.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable2 = collectables[i];
            if(collectable.id === collectable2.id) continue;
            const push = SharedCollisions.entityCollision(collectable, { x: collectable2.x, y: collectable2.y, scale: collectable2.scale });
            const collided = (push !== null);

            if(collided){
                if(collectable.itemStack.item.getName() === collectable2.itemStack.item.getName()){
                    if(collectable.itemStack.mergeStack(collectable2.itemStack)) this.game.entityManager.removeObject(collectable2.id);
                }else{
                    collectable.push(push.x / 2, push.y / 2);
                    collectable2.push(-push.x / 2, -push.y / 2);
                }
            }
        }
    };

    /** Checks for entities that an attacking entity hits and damages them */
    attackHitCheck(entity: Entity, attackdir: number, damage: number): void {
        const entities = this.game.entityManager.getEntities();
        
        const attackpos = {
            x: entity.x + Math.sin(attackdir) * ATTACK_HITBOX_OFFSET,
            y: entity.y + Math.cos(attackdir) * ATTACK_HITBOX_OFFSET,
        };

        for(let i = 0; i < entities.length; i++){
            const entity2 = entities[i];
            const dist = SharedCollisions.getDistance(attackpos, entity2);
            const realdist = dist - (entity.scale + ATTACK_HITBOX_WIDTH) / 2;
            if(entity2.id != entity.id && realdist < 0 && !entity2.hit){
                let killer = "unknown";
                if(entity instanceof NonplayerEntity){
                    killer = entity.definition.displayname;
                }else if(entity instanceof Player){
                    killer = entity.username;
                }

                entity2.takeHit(this.game, damage, killer, entity);
            }
        }
    };
}

export default CollisionManager;