import Game from "../../game.js";
import DroppedStack from "../../objects/droppedStack.js";
import ItemRegistry from "../../registries/itemRegistry.js";
import Layer from "../../world/layer.js";
import ItemStack, { SerializedWriteItemStack } from "../itemStack.js";
import IInventory from "./IInventory.js";

/** A managable collection of item stacks */
class Inventory implements IInventory {
    protected readonly size: number;
    protected readonly slots: (ItemStack | null)[];

    constructor(size: number){
        this.size = size;
        this.slots = Array(size).fill(null);
    }

    /** Returns an inventory object with the given itemstacks in it */
    static readFromSave(inventorydata: SerializedWriteInventory): Inventory {
        const inventory = new Inventory(inventorydata.slots.length);

        for(let i = 0; i < inventory.getSize(); i++){
            const stackdata = inventorydata.slots[i];
            const stack = stackdata ? ItemStack.readFromSave(stackdata) : null;
            inventory.setSlot(i, stack);
        }

        return inventory;
    }

    // #region getters

    /** Returns the amount of slots this inventory can have */
    getSize(): number {
        return this.size;
    }

    /** Returns the itemstack in the requested slot */
    getSlot(slot: number): ItemStack | null {
        return this.slots[slot];
    }

    // #endregion

    // #region inventory operations

    /** Drops this entire inventory onto the ground */
    dropInventory(layer: Layer, x: number, y: number, game: Game): void {
        for(let i = 0; i < this.size; i++){
            this.dropFromSlot(layer, x, y, i, game);
        }
    }

    /** Tries to collect the given item stack and returns if fully take */
    collectStack(itemstack: ItemStack): boolean {
        for(let i = 0; i < this.size; i++){
            if(this.slots[i] != null){
                const done = this.addStackToSlot(i, itemstack);
                if(done) return true;
            }
        }

        const slot = this.nextOpenSlot();
        if(slot == -1) return false;

        this.setSlot(slot, itemstack);
        return true;
    }

    /** Tries to collect the given item and returns the amount leftover */
    collectItem(item: string, amount?: number): number {
        const stacksize = ItemRegistry.get(item).getStackSize();
        let itemamount = amount || 1;

        for(let i = 0; i < this.size && itemamount > 0; i++){
            const itemstack = this.slots[i];
            if(itemstack != null){
                if(itemstack.definition.key == item){
                    const addamount = Math.min(stacksize - itemstack.getAmount(), itemamount);
                    this.addToSlot(i, addamount);
                    itemamount -= addamount;
                }
            }
        }

        for(let nextslot = this.nextOpenSlot(); itemamount > 0 && nextslot != -1; nextslot = this.nextOpenSlot()){
            const addamount = Math.min(stacksize, itemamount);
            this.setSlot(nextslot, new ItemStack(item, addamount));
            itemamount -= addamount;
        }

        return itemamount;
    }

    /** Removes the requested amount of the requested item from this inventory and returns leftovers */
    removeItem(item: string, amount?: number): number {
        let removeamount = amount || 1;

        for(let i = 0; i < this.size && removeamount > 0; i++){
            const itemstack = this.slots[i];
            if(itemstack === null) continue;
            if(itemstack.definition.key != item) continue;

            const stackamount = itemstack.getAmount();
            if(stackamount <= removeamount){
                this.setSlot(i, null);
                removeamount -= stackamount;
            }else{
                this.removeFromSlot(i, removeamount);
                removeamount = 0;
            }
        }

        return removeamount;
    }

    /** Clears this entire inventory */
    clear(): void {
        for(let i = 0; i < this.size; i++){
            this.setSlot(i, null);
        }
    }

    // #endregion

    // #region slot operations

    /** Sets the itemstack in the requested slot to the given itemstack */
    setSlot(slot: number, stack: ItemStack | null): void {
        this.slots[slot] = stack;
    }

    /** Adds the given amount to the requested slot as much as possible */
    addToSlot(slot: number, amount: number): boolean {
        if(this.slots[slot] === null) return false;

        return this.slots[slot].addAmount(amount);
    }

    /** Adds the given stack to the requested slot as much as possible */
    addStackToSlot(slot: number, itemstack: ItemStack): boolean {
        if(this.slots[slot] === null){
            this.slots[slot] = itemstack;
            return true;
        }

        if(this.slots[slot].definition.key != itemstack.definition.key) return false;

        return this.slots[slot].mergeStack(itemstack);
    }

    /** Removes the given amount from the given slot in this inventory */
    removeFromSlot(slot: number, amount: number): boolean {
        if(this.slots[slot] === null) return false;
        if(amount > this.slots[slot].getAmount()) return false;

        if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;

        return true;
    }

    /** Drops the given amount from the given slot in this inventory */
    dropFromSlot(layer: Layer, x: number, y: number, slot: number, game: Game, amount?: number, ignore?: string): void {
        if(this.slots[slot] === null) return;

        if(amount === undefined){
            DroppedStack.dropWithSpread(game, layer, x, y, this.slots[slot], .3, ignore);
            this.slots[slot] = null;
        }else{
            if(amount > this.slots[slot].getAmount()) amount = this.slots[slot].getAmount();

            DroppedStack.dropWithSpread(game, layer, x, y, new ItemStack(this.slots[slot].definition.key, amount), .3, ignore);

            if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;
        }
    }

    /** Swaps the item stacks between two slots */
    swapSlots(slot1: number, slot2: number): void {
        const item1 = this.getSlot(slot1);
        const item2 = this.getSlot(slot2);

        this.setSlot(slot2, item1);
        this.setSlot(slot1, item2);
    }

    // #endregion

    // #region helpers

    /** Returns the next open slot in this players inventory or -1 if there is none */
    nextOpenSlot(): number {
        for(let i = 0; i < this.size; i++){
            if(this.slots[i] === null) return i;
        }
        return -1;
    }

    /** Returns if this inventory contains at least the specified amount of an item */
    contains(item: string, amount: number): boolean {
        return this.containsAmount(item) >= amount;
    }

    /** Returns the amount of the given item that this inventory contains */
    containsAmount(item: string): number {
        let count = 0;
        for(let i = 0; i < this.size; i++){
            const itemstack = this.slots[i];
            if(itemstack === null) continue;
            if(itemstack.definition.key !== item) continue;
            count += itemstack.getAmount();
        }

        return count;
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this inventory for a game update to the client */
    serializeForUpdate(){
        return this.slots.map(itemstack => itemstack ? itemstack.serializeForUpdate() : false);
    }

    /** Returns an object representing this inventory for write */
    serializeForWrite(): SerializedWriteInventory {
        return {
            slots: this.slots.map(stack => stack ? stack.serializeForWrite() : null),
        };
    }

    // #endregion
}

/** Defines the format for serialized writes of an inventory */
export type SerializedWriteInventory = {
    slots: (SerializedWriteItemStack | null)[];
};

export default Inventory;
