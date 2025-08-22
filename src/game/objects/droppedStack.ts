import Layer from "../world/layer.js";
import ItemStack from "../items/itemStack.js";
import GameObject, { SerializedGameObject } from "./gameObject.js";
import Game from "../game.js";
import ItemRegistry from "../registries/itemRegistry.js";

import ServerConfig from "../../configs/server.js";
import { SerializedWriteItemStack } from "../../shared/serializedWriteTypes.js";
const { DROPPED_STACK_TTL } = ServerConfig.OBJECT;

/** A stack of items that has been dropped into the game world and ticking */
class DroppedStack extends GameObject {
    readonly itemStack: ItemStack;
    ignore: string | null = null;
    despawntime: number;

    constructor(layer: Layer, x: number, y: number, itemStack: ItemStack, ignore?: string){
        super(layer, x, y, undefined, .5);

        this.itemStack = itemStack;
        if(ignore !== undefined){
            this.ignore = ignore;
        }
        this.despawntime = Date.now() + DROPPED_STACK_TTL * 1000;
    }

    /** Returns the dropped stack from its save data */
    static readFromSave(layer: Layer, data: SerializedDroppedStack): DroppedStack {
        const droppedstack = new DroppedStack(layer, data.x, data.y, new ItemStack(data.itemStack.name, data.itemStack.amount));
        droppedstack.despawntime = data.despawntime;
        return droppedstack;
    }

    // #region extra constructors

    /** Returns a dropped stack with a random spread from the spawn point */
    static dropWithSpread(game: Game, layer: Layer, x: number, y: number, itemStack: ItemStack, spread: number, ignore?: string): void {
        const angle = Math.random() * 2 * Math.PI;
        const magnitude = Math.random() * spread;

        const xmovement = Math.cos(angle) * magnitude;
        const ymovement = Math.sin(angle) * magnitude;

        const droppedstack = new DroppedStack(layer, x + xmovement, y + ymovement, itemStack, ignore);
        layer.entityManager.addObject(droppedstack);
    }

    /** Returns an array of dropped stack with a random spread from the spawn point */
    static dropManyWithSpread(game: Game, layer: Layer, x: number, y: number, item: string, amount: number, spread: number, ignore?: string): void {
        const stacksize = ItemRegistry.get(item).getStackSize();

        while(amount > 0){
            const itemstack = new ItemStack(item, Math.min(amount, stacksize));
            DroppedStack.dropWithSpread(game, layer, x, y, itemstack, spread, ignore);
            amount -= itemstack.getAmount();
        }
    }

    // #endregion

    // #region getters

    /** Returns this objects asset */
    override getAsset(): string {
        return this.itemStack.definition.getAsset();
    }

    // #endregion

    // #region events

    /** Emits a tick event to this object */
    override emitTickEvent(game: Game, dt: number): void {
        super.emitTickEvent(game, dt);

        game.collisionManager.itemMergeCheck(this);
        this.tickDespawn(game);
    }

    // #endregion

    // #region management

    /** Ticks TTL and deletes self if too old */
    private tickDespawn(game: Game): void {
        if(Date.now() >= this.despawntime) game.entityManager.removeObject(this.id);
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this dropped stacks data for a game update to the client */
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

    /** Returns an object representing this dropped stacks data for writing to the save */
    override serializeForWrite(): SerializedDroppedStack {
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

export type SerializedDroppedStack = SerializedGameObject & {
    type: string,
    itemStack: SerializedWriteItemStack,
    despawntime: number,
}

export default DroppedStack;
