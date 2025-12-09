import SharedConfig from "configs/shared.js";
import { SwingData } from "game/combat/swingData.js";
import Game from "game/game.js";
import DroppedStack from "game/objects/droppedStack.js";
import Entity from "game/objects/entity.js";
import GameObject from "game/objects/gameObject.js";
import NonplayerEntity from "game/objects/nonplayerEntity.js";
import Player from "game/objects/player.js";
import Layer from "game/world/layer.js";
import Circle from "shared/physics/circle.js";
import { checkCollision, getCollisionPush, getCellCollisionObject } from "shared/physics/collision.js";
import CollisionObject from "shared/physics/collisionObject.js";
import V2D from "shared/physics/vector2d.js";

const { ATTACK_HITBOX_WIDTH, ATTACK_HITBOX_OFFSET } = SharedConfig.ATTACK;

/** Manages Collision detection for all elements in the game world */
class CollisionManager {
    private readonly game: Game;

    constructor(game: Game){
        this.game = game;
    }

    /** Checks if a click is over an entity and returns that entity or null if none exist */
    clickEntity(layer: Layer, x: number, y: number): Entity | null {
        const entities = layer.entityManager.getEntities();

        const point = new Circle([x, y], 0);

        for(const entity of entities){
            if(!entity.canCollide()) continue;

            const entitycollider = new Circle([entity.x, entity.y], entity.scale / 2);

            if(checkCollision(point, entitycollider)) return entity;
        }

        return null;
    }

    /** Checks collisions between the given player and other nearby players */
    entityCollisions(entity: Entity): void {
        const entities = entity.layer.entityManager.getEntities();
        const entity1collider = new Circle([entity.x, entity.y], entity.scale / 2);

        for(const entity2 of entities){
            if(entity.id === entity2.id) continue;
            if(!entity2.canCollide()) continue;

            const entity2collider = new Circle([entity2.x, entity2.y], entity2.scale / 2);

            const push = getCollisionPush(entity1collider, entity2collider);
            if(push === null) continue;

            entity.emitCollisionEvent(this.game, entity2, push);
            entity2.emitCollisionEvent(this.game, entity, push);

            entity.push(push[0] / 2, push[1] / 2);
            entity2.push(-push[0] / 2, -push[1] / 2);
        }
    }

    /** Checks for non-player objects colliding on blocks */
    blockCollisions(object: GameObject): void {
        let objectcollider = new Circle([object.x, object.y], object.scale / 2);

        const tiles = object.tilesOn().sort((a, b) => {
            const dista = V2D.getDistance([a[0] + .5, a[1] + .5], objectcollider.getPosition());
            const distb = V2D.getDistance([b[0] + .5, b[1] + .5], objectcollider.getPosition());
            return dista - distb;
        });

        const blocks: CollisionObject[] = [];
        for(const coords of tiles){
            const cell = object.layer.getCell(coords[0], coords[1], false);
            if(cell === null) continue;
            if(cell.block === null) continue;
            if(cell.block.definition.getWalkThrough()) continue;

            const blockcollider = getCellCollisionObject(cell.block.definition.shape, cell.block.definition.scale, [coords[0] + .5, coords[1] + .5]);
            if(blockcollider !== null) blocks.push(blockcollider);
        }

        for(const blockcollider of blocks){
            const push = getCollisionPush(objectcollider, blockcollider);
            if(push !== null){
                object.push(push[0], push[1]);
                objectcollider = new Circle([object.x, object.y], object.scale / 2);
            }
        }
    }

    /** Checks for dropped stacks that the given player can pick up */
    collectCheck(player: Player): void {
        const collectables = player.layer.entityManager.getDroppedStacks();
        const playercollider = new Circle([player.x, player.y], player.scale / 2);

        for(const collectable of collectables){
            if(!collectable.canCollide()) continue;


            const collectablecollider = new Circle([collectable.x, collectable.y], collectable.scale / 2);
            let removeignore = (collectable.ignore === player.id);

            if(checkCollision(playercollider, collectablecollider)){
                if(collectable.ignore === player.id){
                    removeignore = false;
                    continue;
                }
                if(player.getInventory().collectStack(collectable.itemStack)) this.game.entityManager.removeObject(collectable.id);
            }

            if(removeignore) collectable.ignore = null;
        }
    }

    /** Checks for dropped stacks that the given dropped stack can merge with */
    itemMergeCheck(collectable: DroppedStack): void {
        const collectables = collectable.layer.entityManager.getDroppedStacks();
        const collectablecollider = new Circle([collectable.x, collectable.y], collectable.scale / 2);

        for(const collectable2 of collectables){
            if(collectable.id === collectable2.id) continue;
            if(!collectable2.canCollide()) continue;

            const collectable2collider = new Circle([collectable2.x, collectable2.y], collectable2.scale / 2);

            if(checkCollision(collectablecollider, collectable2collider)){
                if(collectable.itemStack.definition.key === collectable2.itemStack.definition.key){
                    if(collectable.itemStack.mergeStack(collectable2.itemStack)) this.game.entityManager.removeObject(collectable2.id);
                }
            }
        }
    }

    /** Checks for entities that an attacking entity hits and damages them */
    attackHitCheck(entity: Entity, swingdata: SwingData): void {
        const entities = entity.layer.entityManager.getEntities();

        const attackpos = {
            x: entity.x + Math.sin(swingdata.dir) * ATTACK_HITBOX_OFFSET,
            y: entity.y + Math.cos(swingdata.dir) * ATTACK_HITBOX_OFFSET,
        };
        const attackcollider = new Circle([attackpos.x, attackpos.y], ATTACK_HITBOX_WIDTH);

        for(const entity2 of entities){
            if(!entity2.canCollide()) continue;
            if(entity2.getHit()) continue;
            if(entity2.id == entity.id) continue;

            const entity2collider = new Circle([entity2.x, entity2.y], entity2.scale / 2);

            if(checkCollision(attackcollider, entity2collider)){
                let killer = "unknown";
                if(entity instanceof NonplayerEntity){
                    killer = entity.definition.displayname;
                }else if(entity instanceof Player){
                    killer = entity.getUsername();
                }

                entity2.takeHit(this.game, swingdata.damage, killer, entity);

                const push = V2D.multiplyScalar(V2D.getUnitVector(V2D.subtract([entity2.x, entity2.y], [entity.x, entity.y])), swingdata.knockback);
                entity2.pushOverTime(push[0], push[1], .2);
            }
        }
    }
}

export default CollisionManager;
