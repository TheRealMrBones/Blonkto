import Player from "../objects/player.js";
import DroppedStack from "../objects/droppedStack.js";
import Entity from "../objects/entity.js";
import Game from "../game.js";
import GameObject from "../objects/gameObject.js";

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
            const dist = getDistance(entity, entity2);
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
        // only search for collisions immediatly next to you
        const startx = Math.floor(object.x - object.scale / 2);
        const starty = Math.floor(object.y - object.scale / 2);

        // lists of possible collisions
        let walls: LineSegment[] = [];
        let circles: Circle[] = [];

        // find all circles and walls for collision
        for(let x = startx; x < object.x + object.scale / 2; x++){
            for(let y = starty; y < object.y + object.scale / 2; y++){
                const cell = this.game.world.getCell(x, y, false);
                if(!cell) continue;
                const block = cell.block;
                if(block === null) continue;

                const pos: Pos = { x: x + block.scale / 2, y: y + block.scale / 2 };

                if(block.shape == SHAPES.SQUARE){
                    const wallResults = getSquareWalls(block.scale, pos);
                    walls = walls.concat(wallResults.walls);
                    circles = circles.concat(wallResults.points);
                }else if(block.shape == SHAPES.CIRCLE){
                    circles.push({ x: pos.x, y: pos.y, radius: block.scale / 2 });
                }
            }
        }

        // calculate collisions and push accordingly
        wallCollisions(object, walls);
        circleCollisions(object, circles);
    };

    /** Checks for dropped stacks that the given player can pick up */
    collectCheck(player: Player): void {
        const collectables = this.game.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable = collectables[i];
            const dist = getDistance(player, collectable);
            const realdist = dist - (player.scale + collectable.scale) / 2;
            if(realdist < 0 && collectable.ignore != player){
                if(player.collectStack(collectable.itemStack)) this.game.removeObject(collectable.id);
            }
        }
    };

    /** Checks for dropped stacks that the given dropped stack can merge with */
    itemMergeCheck(collectable: DroppedStack): void {
        const collectables = this.game.getDroppedStacks();

        for(let i = 0; i < collectables.length; i++){
            const collectable2 = collectables[i];
            const dist = getDistance(collectable, collectable2);
            const realdist = dist - (collectable.scale + collectable2.scale) / 2;
            if(collectable.id != collectable2.id && realdist < 0){
                if(collectable.itemStack.mergeStack(collectable2.itemStack)) this.game.removeObject(collectable2.id);
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
            const dist = getDistance(attackpos, entity);
            const realdist = dist - (player.scale + ATTACK_HITBOX_WIDTH) / 2;
            if(entity.id != player.id && realdist < 0){
                if(entity.takeHit(damage)){
                    entity.eventEmitter.emit("death", player.username, player, this.game);
                }
            }
        }
    };
}

// #endregion shape collisions

/** Returns the collision objects for the given square shape */
function getSquareWalls(scale: number, pos: Pos): { walls: LineSegment[], points: Circle[] } {
    const p = [
        { x: pos.x - scale / 2, y: pos.y - scale / 2, radius: 0 },
        { x: pos.x - scale / 2, y: pos.y + scale / 2, radius: 0 },
        { x: pos.x + scale / 2, y: pos.y + scale / 2, radius: 0 },
        { x: pos.x + scale / 2, y: pos.y - scale / 2, radius: 0 },
    ];
    const walls = [
        { p1: p[0], p2: p[1] },
        { p1: p[1], p2: p[2] },
        { p1: p[2], p2: p[3] },
        { p1: p[3], p2: p[0] },
    ];

    return {
        walls: walls,
        points: p,
    };
}

/** Perform all wall collisions on the given object */
function wallCollisions(object: GameObject, walls: LineSegment[]): void {
    walls.forEach(w => { wallCollision(object, w); });
}

/** Perform wall collision on the given object with the given wall */
function wallCollision(object: GameObject, wall: LineSegment): void {
    const p1 = wall.p1;
    const p2 = wall.p2;
    if(p1.x - p2.x == 0) {
        if(object.y > p1.y && object.y < p2.y || object.y < p1.y && object.y > p2.y) {
            if(Math.abs(object.x - p1.x) <= object.scale / 2) {
                if(object.x - p1.x > 0) {
                    object.push(object.scale / 2 - Math.abs(object.x - p1.x), 0);
                } else {
                    object.push(-(object.scale / 2 - Math.abs(object.x - p1.x)), 0);
                }
            }
        }
    } else if(p1.y - p2.y == 0) {
        if(object.x > p1.x && object.x < p2.x || object.x < p1.x && object.x > p2.x) {
            if(Math.abs(object.y - p1.y) <= object.scale / 2) {
                if(object.y - p1.y > 0) {
                    object.push(0, object.scale / 2 - Math.abs(object.y - p1.y));
                } else {
                    object.push(0, -(object.scale / 2 - Math.abs(object.y - p1.y)));
                }
            }
        }
    }
}

/** Perform all circle collisions on the given object */
function circleCollisions(object: GameObject, circles: Circle[]): void {
    circles.forEach(c => { circleCollision(object, c); });
}

/** Perform circle collision on the given object with the given circle */
function circleCollision(object: GameObject, circle: Circle): void {
    const dist = getDistance(object, circle);
    const realdist = dist - object.scale / 2 - circle.radius;
    if(realdist < 0){
        const dir = dist == 0 ? Math.random() * 2 * Math.PI : Math.atan2(object.x - circle.x, circle.y - object.y);
        object.push(-Math.sin(dir) * realdist, Math.cos(dir) * realdist);
    }
}

// #endregion

// #region helpers

/** Returns the distance between positions */
function getDistance(object1: Pos, object2: Pos): number {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// #endregion

export default CollisionManager;