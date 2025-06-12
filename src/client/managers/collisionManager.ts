import PlayerClient from "../playerClient.js";
import { CollisionObject, CircleCollisionObject } from "../../shared/types.js";
import * as SharedCollisions from "../../shared/collision.js";

class CollisionManager {
    private readonly playerclient: PlayerClient;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    /** Checks collisions between the current player and other nearby players */
    playerCollisions(me: any, players: any[]): void {
        const meobject: CircleCollisionObject = me as CircleCollisionObject;
        const playerobjects: CircleCollisionObject[] = players as CircleCollisionObject[];

        const push = SharedCollisions.entityCollisions(meobject, playerobjects);
        this.playerclient.inputManager.clientPush(push.x, push.y);
    }

    /** Checks collisions between the current player and any nearby blocks with hitboxes */
    blockCollisions(me: any): void {
        const meobject: CircleCollisionObject = me as CircleCollisionObject;

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

        const push = SharedCollisions.blockCollisions(meobject, checkcells);
        this.playerclient.inputManager.clientPush(push.x, push.y);
    }
}

export default CollisionManager;