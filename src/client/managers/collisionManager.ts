import PlayerClient from "../playerClient.js";
import CollisionObject from "../../shared/physics/collisionObject.js";
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
        let playercollider: CollisionObject = this.playerclient.inputManager.getSelfAsCollisionObject();

        const tiles = this.playerclient.inputManager.tilesOn().sort((a, b) => {
            const dista = V2D.getDistance([a[0] + .5, a[1] + .5], playercollider.position);
            const distb = V2D.getDistance([b[0] + .5, b[1] + .5], playercollider.position);
            return dista - distb;
        });

        const blocks: CollisionObject[] = [];
        for(const coords of tiles){
            const cell = this.playerclient.world.getCell(coords[0], coords[1]);
            if(cell === null) continue;
            if(cell.block === undefined) continue;
            if(cell.block.walkthrough) continue;

            const blockcollider = getCellCollisionObject(cell.block.shape, cell.block.scale, [coords[0] + .5, coords[1] + .5]);
            if(blockcollider !== null) blocks.push(blockcollider);
        }

        for(const blockcollider of blocks){
            playercollider = this.playerclient.inputManager.getSelfAsCollisionObject();
            const push = getCollisionPush(playercollider, blockcollider);
            if(push !== null) this.playerclient.inputManager.clientPush(push[0], push[1]);
        }
    }
}

export default CollisionManager;
