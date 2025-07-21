import Game from "../../game.js";
import Layer from "../../world/layer.js";
import ItemStack from "../itemStack.js";
import Inventory from "./inventory.js";

/** A managable collection of item stacks */
class ChangesInventory extends Inventory {
    private readonly changes: boolean[];

    constructor(size: number){
        super(size);

        this.changes = Array(size).fill(true);
    }

    /** Returns an inventory object with the given itemstacks in it */
    static override readFromSave(inventorydata: any[]): ChangesInventory {
        const inventory = new ChangesInventory(inventorydata.length);

        for(let i = 0; i < inventory.getSize(); i++){
            const stackdata = inventorydata[i];
            const stack = stackdata ? ItemStack.readFromSave(stackdata) : null;
            inventory.setSlot(i, stack);
        }

        return inventory;
    }

    // #region slot operations

    /** Sets the itemstack in the requested slot to the given itemstack */
    override setSlot(slot: number, stack: ItemStack | null): void {
        this.toggleChange(slot);
        super.setSlot(slot, stack);
    }

    /** Adds the given amount to the requested slot as much as possible */
    override addToSlot(slot: number, amount: number): boolean {
        this.toggleChange(slot);
        return super.addToSlot(slot, amount);
    }

    /** Adds the given stack to the requested slot as much as possible */
    override addStackToSlot(slot: number, itemstack: ItemStack): boolean {
        this.toggleChange(slot);
        return super.addStackToSlot(slot, itemstack);
    }

    /** Removes the given amount from the given slot in this inventory */
    override removeFromSlot(slot: number, amount: number): boolean {
        this.toggleChange(slot);
        return super.removeFromSlot(slot, amount);
    }

    /** Drops the given amount from the given slot in this inventory */
    override dropFromSlot(layer: Layer, x: number, y: number, slot: number, game: Game, amount?: number, ignore?: string): void {
        this.toggleChange(slot);
        super.dropFromSlot(layer, x, y, slot, game, amount, ignore);
    }

    // #endregion

    // #region changes

    /** Toggles the changed indicator for the requested slot */
    toggleChange(slot: number): void {
        this.changes[slot] = true;
    }

    /** Returns the object representing all changes to this inventory since last reset then resets them */
    getChanges(): any[] {
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

        return changeslist;
    }

    /** Returns if there are any pending changes */
    anyChanges(): boolean {
        return this.changes.some(c => c === true);
    }

    resetChanges(): void {
        for(let i = 0; i < this.size; i++){
            this.changes[i] = false;
        }
    }

    // #endregion
}

export default ChangesInventory;
