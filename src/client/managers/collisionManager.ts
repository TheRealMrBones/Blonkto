import PlayerClient from "../playerClient.js";
import { CollisionObject, CircleCollisionObject, Pos } from "../../shared/types.js";
import * as SharedCollisions from "../../shared/collision.js";

/** Manages client side collisions between the player and other objects / entities in the world */
class CollisionManager {
    private readonly playerclient: PlayerClient;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    /** Checks collisions between the current player and other nearby players */
    playerCollisions(players: any[]): void {
        const meobject: CircleCollisionObject = this.playerclient.inputManager.getSelfAsCollisionObject();
        const playerobjects: CircleCollisionObject[] = players as CircleCollisionObject[];

        const push = SharedCollisions.entityCollisions(meobject, playerobjects);
        this.playerclient.inputManager.clientPush(push.x, push.y);
    }

    /** Checks collisions between the current player and any nearby blocks with hitboxes */
    blockCollisions(): void {
        let push: Pos = { x: 0, y: 0 };
        for(let tries = 0; (tries < 3 && (push.x != 0 || push.y != 0)) || tries == 0; tries++){
            const meobject: CircleCollisionObject = this.playerclient.inputManager.getSelfAsCollisionObject();

            const checkcells: CollisionObject[] = [];
            for(const cellpos of SharedCollisions.getCollisionCheckCells(meobject)){
                const block = this.playerclient.world.getCell(cellpos.x, cellpos.y).block;
                if(!block) continue;
                if(block.walkthrough) continue;

                const blockobject: CollisionObject = {
                    shape: block.shape,
                    scale: block.scale,
                    x: cellpos.x,
                    y: cellpos.y
                };
                checkcells.push(blockobject);
            }

            push = SharedCollisions.blockCollisions(meobject, checkcells);
            this.playerclient.inputManager.clientPush(push.x, push.y);
        }
    }
}

export default CollisionManager;