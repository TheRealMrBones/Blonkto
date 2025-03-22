import { Item } from "./item.js";
import { Recipe } from "./recipe.js";
import { swap } from "../networking/networking.js";
import { SwapContent } from "../../shared/messagecontenttypes.js";

import SharedConfig from "../../configs/shared.js";
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

const inventory: (Item | null)[] = new Array(INVENTORY_SIZE).fill(null);
const recipes: Recipe[] = [];

// #region inventory operations

/** Returns the entire inventory */
export function getInventory(): (Item | null)[] {
    return inventory;
}

/** Returns the item from the given inventory slot */
export function getInventorySlot(slot: number): Item | null {
    return inventory[slot];
}

/** Sets the requested inventory slot to contain the given item */
export function setInventorySlot(slot: number, item: Item): void {
    inventory[slot] = item;

    // show item in slot ui
    const hotbarslot = document.getElementById("slot" + (slot + 1))!;
    
    const itemimage = hotbarslot.querySelector("img");
    if(itemimage) hotbarslot.removeChild(itemimage);

    const itemimg = document.createElement("img");
    itemimg.className = "item";
    itemimg.src = item.asset;
    hotbarslot.appendChild(itemimg);

    const hotbaritemamount = document.getElementById("itemamount" + (slot + 1))!;
    hotbaritemamount.innerHTML = item.amount.toString();
}

/** Sets the entire inventories data to the given inventory */
export function setInventory(itemsdata: any): void {
    for(let i = 0; i < INVENTORY_SIZE; i++){
        const itemdata = itemsdata[i];
        if(itemdata){
            setInventorySlot(i, new Item(itemdata.name, itemdata.asset, itemdata.amount));
        }else{
            clearInventorySlot(i);
        }
    }
}

/** Sets a single inventory slot to the given slot data */
export function setSingleInventorySlot(data: any): void {
    if(data.itemstack === null){
        clearInventorySlot(data.slot);
    }else{
        setInventorySlot(data.slot, new Item(data.itemstack.name, data.itemstack.asset, data.itemstack.amount));
    }
}

/** Clears the given inventory slot of its item and if in the hotbar updates the UI */
export function clearInventorySlot(slot: number): void {
    inventory[slot] = null;

    // remove item in slot ui
    const hotbarslot = document.getElementById("slot" + (slot + 1))!;
    const itemimage = hotbarslot.querySelector("img");
    if(itemimage) hotbarslot.removeChild(itemimage);
    
    const hotbaritemamount = document.getElementById("itemamount" + (slot + 1))!;
    hotbaritemamount.innerHTML = "";
}

/** Clears the entire inventory of its data */
export function clearInventory(): void {
    for(let i = 0; i < INVENTORY_SIZE; i++){
        if(inventory[i] !== null) clearInventorySlot(i);
    }
}

/** Swaps the item stacks between two slots */
export function swapSlots(slot1: number, slot2: number): void {
    const content: SwapContent = {
        slot1: slot1,
        slot2: slot2,
    };
    swap(content);

    /*const item1 = getInventorySlot(slot1);
    const item2 = getInventorySlot(slot2);
    if(item1 !== null){
        setInventorySlot(slot2, item1)
    }else{
        clearInventorySlot(slot2);
    }
    if(item2 !== null){
        setInventorySlot(slot1, item2)
    }else{
        clearInventorySlot(slot1);
    }*/
}

// #endregion

// #region recipes

/** Adds new recipes to the saved list */
export function addRecipes(recipesdata: any[]): void {
    for(const recipedata of recipesdata){
        recipes.push(new Recipe(recipedata.result, recipedata.ingredients, recipedata.resultcount, recipedata.asset));
    }
}

/** Returns all craftable recipes with the current inventory */
export function getCraftableRecipes(): Recipe[] {
    const craftablerecipes: Recipe[] = [];
    for(const recipe of recipes){
        if(recipe.canCraft(inventory)) craftablerecipes.push(recipe);
    }
    return craftablerecipes;
}

// #endregion