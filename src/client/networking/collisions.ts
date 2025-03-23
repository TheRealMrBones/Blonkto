import { clientPush } from "../input/input.js";
import { getCell } from "../world/world.js";
import { CollisionObject, CircleCollisionObject } from "../../shared/types.js";
import * as SharedCollisions from "../../shared/collision.js";

import Constants from "../../shared/constants.js";
const { SHAPES } = Constants;

// #region get collisions

/** Checks collisions between the current player and other nearby players */
export function playerCollisions(me: any, players: any[]): void {
    const meobject: CircleCollisionObject = me as CircleCollisionObject;
    const playerobjects: CircleCollisionObject[] = players as CircleCollisionObject[];

    const push = SharedCollisions.entityCollisions(meobject, playerobjects);
    clientPush(push.x, push.y);
}

/** Checks collisions between the current player and any nearby blocks with hitboxes */
export function blockCollisions(me: any): void {
    const meobject: CircleCollisionObject = me as CircleCollisionObject;

    const checkcells: CollisionObject[] = [];
    for(const cellpos of SharedCollisions.getCollisionCheckCells(meobject)){
        const block = getCell(cellpos.x, cellpos.y).block;
        if(block){
            const blockobject: CollisionObject = {
                shape: block.shape,
                scale: block.scale,
                x: cellpos.x,
                y: cellpos.y
            };
            checkcells.push(blockobject);
        }
    }

    const push = SharedCollisions.blockCollisions(meobject, checkcells);
    clientPush(push.x, push.y);
}

// #endregion