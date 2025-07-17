import Game from "../../game.js";
import ItemStack from "../itemStack.js";
import IInventory from "./IInventory.js";

class CombinedInventory implements IInventory {
    private readonly inventories: IInventory[];

    constructor(inventories: IInventory[]){
        this.inventories = inventories;
    }

    // #region getters

    /** Returns the amount of slots this inventory can have */
    getSize(): number {
        let size = 0;
        for(const inventory of this.inventories){
            size += inventory.getSize();
        }
        return size;
    }

    /** Returns the itemstack in the requested slot */
    getSlot(slot: number): ItemStack | null {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return null;

        return realslot.inventory.getSlot(realslot.slot);
    }

    // #endregion

    // #region inventory operations
    
    /** Drops this entire inventory onto the ground */
    dropInventory(x: number, y: number, game: Game): void {
        for(const inventory of this.inventories){
            inventory.dropInventory(x, y, game);
        }
    }

    /** Tries to collect the given item stack and returns if fully take */
    collectStack(itemstack: ItemStack): boolean {
        for(const inventory of this.inventories){
            if(inventory.collectStack(itemstack)) return true;
        }

        return false;
    }

    /** Tries to collect the given item and returns the amount leftover */
    collectItem(item: string, amount?: number): number {
        let itemamount = amount || 1;

        for(const inventory of this.inventories){
            itemamount = inventory.collectItem(item, itemamount);
            if(itemamount == 0) return 0;
        }

        return itemamount;
    }

    /** Removes the requested amount of the requested item from this inventory and returns leftovers */
    removeItem(item: string, amount?: number): number {
        let removeamount = amount || 1;

        for(const inventory of this.inventories){
            removeamount = inventory.removeItem(item, removeamount);
            if(removeamount == 0) return 0;
        }

        return removeamount;
    }

    /** Clears this entire inventory */
    clear(): void {
        for(const inventory of this.inventories){
            inventory.clear();
        }
    }

    // #endregion

    // #region slot operations

    /** Sets the itemstack in the requested slot to the given itemstack */
    setSlot(slot: number, stack: ItemStack | null): void {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return;

        realslot.inventory.setSlot(realslot.slot, stack);
    }

    /** Adds the given amount to the requested slot as much as possible */
    addToSlot(slot: number, amount: number): boolean {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return false;

        return realslot.inventory.addToSlot(realslot.slot, amount);
    }

    /** Adds the given stack to the requested slot as much as possible */
    addStackToSlot(slot: number, itemstack: ItemStack): boolean {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return false;

        return realslot.inventory.addStackToSlot(realslot.slot, itemstack);
    }

    /** Removes the given amount from the given slot in this inventory */
    removeFromSlot(slot: number, amount: number): boolean {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return false;

        return realslot.inventory.removeFromSlot(realslot.slot, amount);
    }

    /** Drops the given amount from the given slot in this inventory */
    dropFromSlot(x: number, y: number, slot: number, game: Game, amount?: number, ignore?: string): void {
        const realslot = this.getRealSlot(slot);
        if(realslot === null) return;

        realslot.inventory.dropFromSlot(x, y, realslot.slot, game, amount, ignore);
    }

    /** Swaps the item stacks between two slots */
    swapSlots(slot1: number, slot2: number): void {
        const realslot1 = this.getRealSlot(slot1);
        const realslot2 = this.getRealSlot(slot2);
        if(realslot1 === null || realslot2 === null) return;

        const stack1 = realslot1.inventory.getSlot(realslot1.slot);
        const stack2 = realslot2.inventory.getSlot(realslot2.slot);

        realslot2.inventory.setSlot(realslot2.slot, stack1);
        realslot1.inventory.setSlot(realslot1.slot, stack2);
    }

    // #endregion

    // #region helpers

    /** Returns the next open slot in this players inventory or -1 if there is none */
    nextOpenSlot(): number {
        for(const inventory of this.inventories){
            const slot = inventory.nextOpenSlot();
            if(slot >= 0) return slot;
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
        for(const inventory of this.inventories){
            count += inventory.containsAmount(item);
        }

        return count;
    }

    /** Returns the inventory and slot that the given slot would map to for this combined inventory */
    private getRealSlot(slot: number): RealSlot | null {
        let invstart = 0;
        for(const inventory of this.inventories){
            const size = inventory.getSize();

            if(slot < invstart + size){
                const realslot = slot - invstart;
                return {
                    inventory: inventory,
                    slot: realslot,
                };
            }

            invstart += size;
        }

        return null;
    }

    // #endregion
}

type RealSlot = {
    inventory: IInventory;
    slot: number;
}

export default CombinedInventory;
