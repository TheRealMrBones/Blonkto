import ItemStack from "../items/itemStack.js";
import GameObject from "./gameObject.js";
import Game from "../game.js";
import { itemMergeCheck } from "../collisions.js";

/** A stack of items that has been dropped into the game world and ticking */
class DroppedStack extends GameObject {
    itemStack: ItemStack;

    constructor(x: number, y: number, itemStack: ItemStack){
        super(x, y, undefined, .5);

        this.itemStack = itemStack;
        this.asset = itemStack.item.asset;

        // add collision checks
        this.eventEmitter.on("tick", (game: Game, dt: number) => {
            itemMergeCheck(this, game.getDroppedStacks(), game);
        });
    }

    /** Returns the dropped stack from its save data */
    static readFromSave(data: any): DroppedStack {
        return new DroppedStack(data.x, data.y, new ItemStack(data.itemStack.name, data.itemStack.amount));
    }

    /** Returns a dropped stack with a random spread from the spawn point */
    static getDroppedWithSpread(x: number, y: number, itemStack: ItemStack, spread: number){
        const angle = Math.random() * 2 * Math.PI;
        const magnitude = Math.random() * spread;

        const xmovement = Math.cos(angle) * magnitude;
        const ymovement = Math.sin(angle) * magnitude;

        return new DroppedStack(x + xmovement, y + ymovement, itemStack);
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
        };
    }

    // #endregion
}

export default DroppedStack;