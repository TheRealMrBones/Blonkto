import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import Player from "../objects/player.js";
import ItemRegistry from "../registries/itemRegistry.js";
import ItemStack from "./itemStack.js";

/** A managable collection of item stacks */
class Inventory {
    private size: number;
    private slots: (ItemStack | null)[];
    private changes: null | boolean[];

    constructor(size: number, trackchanges?: boolean){
        this.size = size;
        this.slots = Array(size).fill(null);

        if(trackchanges) this.changes = Array(size).fill(false);
        else this.changes = null;
    }

    /** Returns an inventory object with the given itemstacks in it */
    static readFromSave(inventorydata: any[], trackchanges?: boolean): Inventory {
        const inventory = new Inventory(inventorydata.length, trackchanges);
        inventory.slots = inventorydata.map((data: any) => data ? ItemStack.readFromSave(data) : null);
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
    collectStack(itemstack: ItemStack): boolean {
        for(let i = 0; i < this.size; i++){
            const itemstack2 = this.slots[i];
            if(itemstack2 != null){
                const done = itemstack2.mergeStack(itemstack);
                this.toggleChange(i);
                if(done) return true;
            }
        }

        const slot = this.nextOpenSlot();
        if(slot == -1) return false;

        this.slots[slot] = itemstack;
        this.toggleChange(slot);
        return true;
    }

    /** Tries to collect the given item and returns the amount leftover */
    collectItem(item: string, amount?: number): number {
        const stacksize = ItemRegistry.get(item).getStackSize();
        let itemamount = amount || 1;
        
        for(let i = 0; i < this.size && itemamount > 0; i++){
            const itemstack = this.slots[i];
            if(itemstack != null){
                if(itemstack.definition.getRegistryKey() == item){
                    const addamount = Math.min(stacksize - itemstack.getAmount(), itemamount);
                    itemstack.addAmount(addamount);
                    itemamount -= addamount;
                    this.toggleChange(i);
                }
            }
        }

        for(let nextslot = this.nextOpenSlot(); itemamount > 0 && nextslot != -1; nextslot = this.nextOpenSlot()){
            const addamount = Math.min(stacksize, itemamount);
            this.slots[nextslot] = new ItemStack(item, addamount);
            itemamount -= addamount;
            this.toggleChange(nextslot);
        }

        return itemamount;
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
        this.toggleChange(slot);
    }

    /** Adds the given stack to the requested slot as much as possible */
    addToSlot(slot: number, itemstack: ItemStack): boolean {
        if(this.slots[slot] === null){
            this.slots[slot] = itemstack;
            this.toggleChange(slot);
            return true;
        }

        if(this.slots[slot].definition.getRegistryKey() != itemstack.definition.getRegistryKey()) return false;

        this.toggleChange(slot);
        return this.slots[slot].mergeStack(itemstack);
    }

    /** Removes the given amount from the given slot in this inventory */
    removeFromSlot(slot: number, amount: number): boolean {
        if(this.slots[slot] === null) return false;
        if(amount > this.slots[slot].getAmount()) return false;

        if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;
        this.toggleChange(slot);

        return true;
    }

    /** Removes the requested amount of the requested item from this inventory */
    removeItem(item: string, amount?: number): void {
        let removeamount = amount || 1;

        for(let i = 0; i < this.size && removeamount > 0; i++){
            const itemstack = this.slots[i];
            if(itemstack === null) continue;
            if(itemstack.definition.getRegistryKey() != item) continue;

            const stackamount = itemstack.getAmount();
            if(stackamount <= removeamount){
                this.slots[i] = null;
                removeamount -= stackamount;
            }else{
                itemstack.removeAmount(removeamount);
                removeamount = 0;
            }
            this.toggleChange(i);
        }
    }

    /** Drops an individual stack (or partial stack) from this inventory */
    dropStack(x: number, y: number, slot: number, game: Game, amount?: number, ignore?: string): void {
        if(this.slots[slot] === null) return;

        if(amount === undefined){
            DroppedStack.dropWithSpread(game, x, y, this.slots[slot], .3, ignore);
            this.slots[slot] = null;
        }else{
            if(amount > this.slots[slot].getAmount()) amount = this.slots[slot].getAmount();

            DroppedStack.dropWithSpread(game, x, y, new ItemStack(this.slots[slot].definition.getRegistryKey(), amount), .3, ignore);
            
            if(this.slots[slot].removeAmount(amount)) this.slots[slot] = null;
        }
        this.toggleChange(slot);
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
        this.toggleChange(slot1);
        this.toggleChange(slot2);
    }

    /** Clears the requested slot in this inventory */
    clearSlot(slot: number): void {
        this.slots[slot] = null;
        this.toggleChange(slot);
    }

    /** Clears this entire inventory */
    clear(): void {
        for(let i = 0; i < this.size; i++){
            this.clearSlot(i);
        }
    }

    // #endregion

    // #region changes

    /** Toggles the changed indicator for the requested slot */
    toggleChange(slot: number): void {
        if(this.changes !== null) this.changes[slot] = true;
    }

    /** Returns the object representing all changes to this inventory since last reset then resets them */
    getChanges(): any[] {
        if(this.changes === null) return [];
        const changeslist = [];
        for(let i = 0; i < this.size; i++){
            if(this.changes[i]){
                const itemstack = this.slots[i];
                changeslist.push({
                    slot: i,
                    itemstack: itemstack !== null ? itemstack.serializeForUpdate() : null,
                });
            }
        }

        this.resetChanges();
        return changeslist;
    }

    resetChanges(): void {
        if(this.changes === null) return;
        for(let i = 0; i < this.size; i++){
            this.changes[i] = false;
        }
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
            if(itemstack.definition.getRegistryKey() !== item) continue;
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
    serializeForWrite(): any {
        return this.slots.map(stack => stack ? stack.serializeForWrite() : null);
    }

    // #endregion
}

export default Inventory;