import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import Player from "../objects/player.js";
import ItemStack from "./itemStack.js";

/** A managable collection of item stacks */
class Inventory {
    private size: number;
    private slots: (ItemStack | null)[];

    constructor(size: number){
        this.size = size;
        this.slots = Array(size).fill(null);
    }

    /** Returns an inventory object with the given itemstacks in it */
    static readFromSave(inventorydata: any[]): Inventory {
        const inventory = new Inventory(inventorydata.length);
        inventory.slots = inventorydata.map((stack: { name: string; amount: number | undefined; }) => stack ? new ItemStack(stack.name, stack.amount) : null);
        return inventory;
    }

    /** Returns the amount of slots this inventory can have */
    getSize(): number {
        return this.size;
    }

    // #region inventory operations
    
    /** Drops this entire inventory onto the ground */
    dropInventory(x: number, y: number, game: Game): void {
        for(let i = 0; i < this.size; i++){
            this.dropStack(x, y, i, game);
        }
    }

    /** Tries to collect the given item stack and returns if fully take */
    collectStack(itemstack: ItemStack, inventoryupdates?: any): boolean {
        for(let i = 0; i < this.size; i++){
            const itemstack2 = this.slots[i];
            if(itemstack2 != null){
                const done = itemstack2.mergeStack(itemstack);

                inventoryupdates.push({
                    slot: i,
                    itemstack: this.slots[i] ? itemstack2.serializeForUpdate() : null,
                });

                if(done) return true;
            }
        }

        const slot = this.nextOpenSlot();
        if(slot == -1) return false;

        this.slots[slot] = itemstack;
        inventoryupdates.push({
            slot: slot,
            itemstack: itemstack ? itemstack.serializeForUpdate() : null,
        });
        return true;
    }

    // #endregion

    // #region slot operations

    /** Returns the itemstack in the requested slot */
    getSlot(slot: number): ItemStack | null {
        return this.slots[slot];
    }

    /** Sets the itemstack in the requested slot to the given itemstack */
    setSlot(slot: number, stack: ItemStack | null): void {
        this.slots[slot] = stack;
    }

    /** Adds the given stack to the requested slot as much as possible */
    addToSlot(slot: number, stack: ItemStack): boolean {
        if(this.slots[slot] === null){
            this.slots[slot] = stack;
            return true;
        }

        if(this.slots[slot].item.name != stack.item.name) return false;

        return this.slots[slot].mergeStack(stack);
    }

    /** Removes the given amount from the given slot in this inventory */
    removeFromSlot(slot: number, amount: number): boolean {
        if(this.slots[slot] == null) return false;
        if(amount > this.slots[slot].getAmount()) return false;

        if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;

        return true;
    }

    /** Drops an individual stack (or partial stack) from this inventory */
    dropStack(x: number, y: number, slot: number, game: Game, amount?: number, ignore?: Player): void {
        if(this.slots[slot] === null) return;

        if(amount === undefined){
            const droppedstack = DroppedStack.getDroppedWithSpread(x, y, this.slots[slot], .3, ignore);
            game.objects[droppedstack.id] = droppedstack;
            this.slots[slot] = null;
        }else{
            if(amount > this.slots[slot].getAmount()) amount = this.slots[slot].getAmount();

            const droppedstack = DroppedStack.getDroppedWithSpread(x, y, new ItemStack(this.slots[slot].item.name, amount), .3, ignore);
            game.objects[droppedstack.id] = droppedstack;

            if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;
        }
    }

    /** Swaps the item stacks between two slots */
    swapSlots(slot1: number, slot2: number): void {
        const item1 = this.getSlot(slot1);
        const item2 = this.getSlot(slot2);
        if(item1 !== null){
            this.setSlot(slot2, item1);
        }else{
            this.clearSlot(slot2);
        }
        if(item2 !== null){
            this.setSlot(slot1, item2);
        }else{
            this.clearSlot(slot1);
        }
    }

    /** Clears the requested slot in this inventory */
    clearSlot(slot: number): void {
        this.slots[slot] = null;
    }

    /** Clears this entire inventory */
    clear(): void {
        for(let i = 0; i < this.size; i++){
            this.clearSlot(i);
        }
    }

    // #endregion

    // #region helpers

    /** Returns the next open slot in this players inventory or -1 if there is none */
    nextOpenSlot(): number {
        for(let i = 0; i < this.size; i++){
            if(this.slots[i] == null) return i;
        }
        return -1;
    }

    // #endregion

    // #region serialization

    /** Returns an object representing this inventory for a game update to the client */
    serializeForUpdate(){
        return this.slots.map(itemstack => itemstack ? itemstack.serializeForUpdate() : false);
    }

    /** Returns an object representing this inventory for write */
    serializeForWrite(): any {
        return this.slots.map(stack => stack ? stack.serializeForWrite() : null);
    }

    // #endregion
}

export default Inventory;