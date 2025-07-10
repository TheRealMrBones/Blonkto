import Game from "../../game.js";
import ItemStack from "../itemStack.js";

/** The base interface for objects that hold itemstacks in the game world */
interface IInventory {
    // #region getters

    /** Returns the amount of slots this inventory can have */
    getSize(): number;

    /** Returns the itemstack in the requested slot */
    getSlot(slot: number): ItemStack | null;

    // #endregion

    // #region inventory operations
    
    /** Drops this entire inventory onto the ground */
    dropInventory(x: number, y: number, game: Game): void;

    /** Tries to collect the given item stack and returns if fully take */
    collectStack(itemstack: ItemStack): boolean;

    /** Tries to collect the given item and returns the amount leftover */
    collectItem(item: string, amount?: number): number;

    // #endregion

    // #region slot operations

    /** Sets the itemstack in the requested slot to the given itemstack */
    setSlot(slot: number, stack: ItemStack | null): void;

    /** Adds the given stack to the requested slot as much as possible */
    addToSlot(slot: number, itemstack: ItemStack): boolean;

    /** Removes the given amount from the given slot in this inventory */
    removeFromSlot(slot: number, amount: number): boolean;

    /** Removes the requested amount of the requested item from this inventory and returns leftovers */
    removeItem(item: string, amount?: number): number;

    /** Drops an individual stack (or partial stack) from this inventory */
    dropStack(x: number, y: number, slot: number, game: Game, amount?: number, ignore?: string): void;

    /** Swaps the item stacks between two slots */
    swapSlots(slot1: number, slot2: number): void;

    /** Clears this entire inventory */
    clear(): void;

    // #endregion

    // #region helpers

    /** Returns the next open slot in this players inventory or -1 if there is none */
    nextOpenSlot(): number;

    /** Returns if this inventory contains at least the specified amount of an item */
    contains(item: string, amount: number): boolean;

    /** Returns the amount of the given item that this inventory contains */
    containsAmount(item: string): number;

    // #endregion
}

export default IInventory;