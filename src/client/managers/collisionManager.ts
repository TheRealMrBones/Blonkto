import PlayerClient from "../playerClient.js";
import CollisionObject from "../../shared/physics/collisionObject.js";
import { Vector2D } from "../../shared/types.js";
import { getCellCollisionObject, getCollisionPush } from "../../shared/physics/collision.js";
import V2D from "../../shared/physics/vector2d.js";

/** Manages client side collisions between the player and other objects / entities in the world */
class CollisionManager {
    private readonly playerclient: PlayerClient;

    constructor(playerclient: PlayerClient) {
        this.playerclient = playerclient;
    }

    /** Checks collisions between the current player and any nearby blocks with hitboxes */
    blockCollisions(): void {
        let push: Vector2D = [0, 0];
        for(let tries = 0; (tries < 3 && (push[0] != 0 || push[1] != 0)) || tries == 0; tries++){
            const playercollider: CollisionObject = this.playerclient.inputManager.getSelfAsCollisionObject();

            const blocks: CollisionObject[] = [];
            for(const coords of this.playerclient.inputManager.tilesOn()){
                const cell = this.playerclient.world.getCell(coords[0], coords[1]);
                if(cell === null) continue;
                if(cell.block === undefined) continue;
                if(cell.block.walkthrough) continue;

                const blockcollider = getCellCollisionObject(cell.block.shape, cell.block.scale, [coords[0] + .5, coords[1] + .5]);
                if(blockcollider !== null) blocks.push(blockcollider);
            }

            let push: Vector2D = [0, 0];
            for(const blockcollider of blocks){
                const newpush = getCollisionPush(playercollider, blockcollider);
                if(newpush !== null) push = V2D.add(push, newpush);
            }

            if(push[0] != 0 || push[1] != 0) this.playerclient.inputManager.clientPush(push[0], push[1]);
        }
    }
}

export default CollisionManager;
