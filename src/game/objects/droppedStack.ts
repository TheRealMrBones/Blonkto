import ItemStack from "../items/itemStack.js";
import GameObject from "./gameObject.js";
import Game from "../game.js";
import Player from "./player.js";

import ServerConfig from "../../configs/server.js";
const { DROPPED_STACK_TTL } = ServerConfig.OBJECT;

/** A stack of items that has been dropped into the game world and ticking */
class DroppedStack extends GameObject {
    itemStack: ItemStack;
    ignore: Player | null = null;
    despawntime: number;

    constructor(x: number, y: number, itemStack: ItemStack, ignore?: Player){
        super(x, y, undefined, .5);

        this.itemStack = itemStack;
        this.asset = itemStack.item.asset;
        if(ignore !== undefined){
            this.ignore = ignore;
            setTimeout(() => {
                this.ignore = null;
            }, 1000);
        }
        this.despawntime = Date.now() + DROPPED_STACK_TTL * 1000;

        // add collision checks
        this.eventEmitter.on("tick", (game: Game, dt: number) => {
            game.collisionManager.itemMergeCheck(this);
            this.tickDespawn(game);
        });
    }

    /** Returns the dropped stack from its save data */
    static readFromSave(data: any): DroppedStack {
        const droppedstack = new DroppedStack(data.x, data.y, new ItemStack(data.itemStack.name, data.itemStack.amount));
        droppedstack.despawntime = data.despawntime;
        return droppedstack;
    }

    /** Returns a dropped stack with a random spread from the spawn point */
    static getDroppedWithSpread(x: number, y: number, itemStack: ItemStack, spread: number, ignore?: Player){
        const angle = Math.random() * 2 * Math.PI;
        const magnitude = Math.random() * spread;

        const xmovement = Math.cos(angle) * magnitude;
        const ymovement = Math.sin(angle) * magnitude;

        return new DroppedStack(x + xmovement, y + ymovement, itemStack, ignore);
    }

    /** Ticks TTL and deletes self if too old */
    tickDespawn(game: Game): void {
        if(Date.now() >= this.despawntime) game.removeObject(this.id);
    }

    // #region serialization

    /** Return an object representing this dropped stacks data for a game update to the client */
    override serializeForUpdate(): any {
        const base = super.serializeForUpdate();

        return {
            static: {
                ...base.static,
            },
            dynamic: {
                ...base.dynamic,
            },
        };
    }

    /** Return an object representing this dropped stacks data for writing to the save */
    override serializeForWrite(): any {
        const base = super.serializeForWrite();
        
        return {
            ...base,
            type: "dropped_stack",
            itemStack: this.itemStack.serializeForWrite(),
            despawntime: this.despawntime,
        };
    }

    // #endregion
}

export default DroppedStack;