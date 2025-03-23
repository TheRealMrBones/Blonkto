import Player from "../objects/player.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import Game from "../game.js";
import GameObject from "../objects/gameObject.js";
import { CollisionObject, CircleCollisionObject } from "../../shared/types.js";
import * as SharedCollisions from "../../shared/collision.js";

import SharedConfig from "../../configs/shared.js";
const { ATTACK_HITBOX_WIDTH, ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;

import Constants from "../../shared/constants.js";
const { SHAPES } = Constants;

/** Manages Collision detection for all elements in the game world */
class CollisionManager {
    game: Game;

    constructor(game: Game){
        this.game = game;
    }

    /** Checks collisions between the given player and other nearby players */
    entityCollisions(entity: Entity): void {
        const entities = this.game.getEntities();

        for(let i = 0; i < entities.length; i++){
            const entity2 = entities[i];
            const dist = SharedCollisions.getDistance(entity, entity2);
            const realdist = dist - (entity.scale / 2 + entity2.scale / 2);
            if(realdist < 0){
                const dir = dist == 0 ? Math.random() * 2 * Math.PI : Math.atan2(entity.x - entity2.x, entity2.y - entity.y);
                entity.push(-Math.sin(dir) * realdist / 2, Math.cos(dir) * realdist / 2);
                entity2.push(Math.sin(dir) * realdist / 2, -Math.cos(dir) * realdist / 2);
            }
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

            const blockobject: CollisionObject = {
                shape: block.shape,
                scale: block.scale,
                x: cellpos.x,
                y: cellpos.y
            };
            checkcells.push(blockobject);
        }
    
        const push = SharedCollisions.blockCollisions(meobject, checkcells);
        object.x += push.x;
        object.y += push.y;
    };

    /** Checks for dropped stacks that the given player can pick up */
    collectCheck(player: Player): void {
        const collectables = this.game.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable = collectables[i];
            const dist = SharedCollisions.getDistance(player, collectable);
            const realdist = dist - (player.scale + collectable.scale) / 2;
            if(realdist < 0 && collectable.ignore != player){
                if(player.inventory.collectStack(collectable.itemStack)) this.game.removeObject(collectable.id);
            }
        }
    };

    /** Checks for dropped stacks that the given dropped stack can merge with */
    itemMergeCheck(collectable: DroppedStack): void {
        const collectables = this.game.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable2 = collectables[i];
            const dist = SharedCollisions.getDistance(collectable, collectable2);
            const realdist = dist - (collectable.scale + collectable2.scale) / 2;
            if(realdist < 0){
                if(collectable.id != collectable2.id){
                    if(collectable.itemStack.mergeStack(collectable2.itemStack)) this.game.removeObject(collectable2.id);
                }else{
                    const dir = dist == 0 ? Math.random() * 2 * Math.PI : Math.atan2(collectable.x - collectable2.x, collectable2.y - collectable.y);
                    collectable.push(-Math.sin(dir) * realdist / 2, Math.cos(dir) * realdist / 2);
                    collectable2.push(Math.sin(dir) * realdist / 2, -Math.cos(dir) * realdist / 2);
                }
            }
        }
    };

    /** Checks for entities that an attacking player hits and damages them */
    attackHitCheck(player: Player, attackdir: number, damage: number): void {
        const entities = this.game.getEntities();
        
        const attackpos = {
            x: player.x + Math.sin(attackdir) * ATTACK_HITBOX_OFFSET,
            y: player.y + Math.cos(attackdir) * ATTACK_HITBOX_OFFSET,
        };

        for(let i = 0; i < entities.length; i++){
            const entity = entities[i];
            const dist = SharedCollisions.getDistance(attackpos, entity);
            const realdist = dist - (player.scale + ATTACK_HITBOX_WIDTH) / 2;
            if(entity.id != player.id && realdist < 0){
                if(entity.takeHit(damage)){
                    entity.eventEmitter.emit("death", player.username, player, this.game);
                }
            }
        }
    };
}

export default CollisionManager;