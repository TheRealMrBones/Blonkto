import PlayerClient from "../playerClient.js";
import Item from "./item.js";
import Recipe from "./recipe.js";
import { SwapContent } from "../../shared/messageContentTypes.js";
import { SerializedUpdateItemStack } from "../../shared/serialization/items/serializedItemStack.js";
import { SerializedChangesInventory, SerializedChangesSlot, SerializedUpdateInventory } from "../../shared/serialization/items/serializedInventory.js";
import { SerializedRecipe } from "../../shared/serialization/items/serializedRecipe.js";

import SharedConfig from "../../configs/shared.js";
const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

/** The representation of inventory data of the client */
class Inventory {
    private readonly playerclient: PlayerClient;
    private readonly inventory: (Item | null)[] = new Array(INVENTORY_SIZE + 27).fill(null);
    private readonly recipes: Recipe[] = [];
    station: string | null = null;

    constructor(playerclient: PlayerClient){
        this.playerclient = playerclient;
    }

    // #region inventory operations

    /** Returns the entire inventory */
    getInventory(): (Item | null)[] {
        return this.inventory;
    }

    /** Returns the item from the given inventory slot */
    getInventorySlot(slot: number): Item | null {
        return this.inventory[slot];
    }

    /** Sets the requested inventory slot to contain the given item */
    setInventorySlot(slot: number, item: Item): void {
        this.inventory[slot] = item;

        // show item in slot ui
        const hotbarslot = document.getElementById("slot" + (slot + 1))!;

        const itemimage = hotbarslot.querySelector("img");
        if(itemimage !== null) hotbarslot.removeChild(itemimage);

        const itemimg = document.createElement("img");
        itemimg.className = "item";
        itemimg.src = `/assets/${item.asset}.png`;
        hotbarslot.appendChild(itemimg);

        const hotbaritemamount = document.getElementById("itemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = item.amount.toString();
    }

    /** Sets the entire inventories data to the given inventory */
    setInventory(itemsdata: SerializedUpdateItemStack[]): void {
        for(let i = 0; i < INVENTORY_SIZE; i++){
            const itemdata = itemsdata[i];
            if(itemdata){
                this.setInventorySlot(i, new Item(itemdata.name, itemdata.asset, itemdata.amount));
            }else{
                this.clearInventorySlot(i);
            }
        }
    }

    /** Sets a single inventory slot to the given slot data */
    setSingleInventorySlot(data: SerializedChangesSlot): void {
        if(data.itemstack === null){
            this.clearInventorySlot(data.slot);
        }else{
            this.setInventorySlot(data.slot, new Item(data.itemstack.name, data.itemstack.asset, data.itemstack.amount));
        }
    }

    /** Clears the given inventory slot of its item and if in the hotbar updates the UI */
    clearInventorySlot(slot: number): void {
        this.inventory[slot] = null;

        // remove item in slot ui
        const hotbarslot = document.getElementById("slot" + (slot + 1))!;
        const itemimage = hotbarslot.querySelector("img");
        if(itemimage) hotbarslot.removeChild(itemimage);

        const hotbaritemamount = document.getElementById("itemamount" + (slot + 1))!;
        hotbaritemamount.innerHTML = "";
    }

    /** Clears the entire inventory of its data */
    clearInventory(): void {
        for(let i = 0; i < INVENTORY_SIZE; i++){
            if(this.inventory[i] !== null) this.clearInventorySlot(i);
        }
    }

    /** Swaps the item stacks between two slots */
    swapSlots(slot1: number, slot2: number): void {
        const content: SwapContent = {
            slot1: slot1,
            slot2: slot2,
        };
        this.playerclient.networkingManager.swap(content);

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
    addRecipes(recipesdata: SerializedRecipe[]): void {
        for(const recipedata of recipesdata){
            this.recipes.push(new Recipe(recipedata.result, recipedata.ingredients, recipedata.resultcount, recipedata.station, recipedata.asset, this.playerclient));
        }
    }

    /** Returns all craftable recipes with the current inventory */
    getCraftableRecipes(): Recipe[] {
        const craftablerecipes: Recipe[] = [];
        for(const recipe of this.recipes){
            if(recipe.canCraft(this.inventory, this.station)) craftablerecipes.push(recipe);
        }
        return craftablerecipes;
    }

    /** Sets recipe visibility based on the current inventory */
    setRecipeVisibility(): void {
        for(const recipe of this.recipes){
            recipe.toggleVisibility(this.inventory, this.station);
        }
    }

    /** Clears the entire recipe list in this client */
    clearRecipes(): void {
        this.recipes.splice(0, this.recipes.length);

        const craftingmenu = document.getElementById("craftingmenu")!;
        craftingmenu.innerHTML = "";
    }

    // #endregion

    // #region station

    /** Sets the current station being used by the player */
    setStation(station: string | null): void {
        this.station = station;
        if(station === null) this.clearStationInventory();
        this.setRecipeVisibility();
    }

    /** Clears the closed stations inventory data */
    clearStationInventory(): void {
        for(let i = 0; i < 27; i++){
            this.clearInventorySlot(i + 36);
        }
    }

    /** Sets the station inventory slots */
    setStationInventory(data: SerializedUpdateInventory): void {
        for(let i = 0; i < 27; i++){
            const itemdata = data[i];
            if(itemdata !== null){
                this.setInventorySlot(i + 36, new Item(itemdata.name, itemdata.asset, itemdata.amount));
            }else{
                this.clearInventorySlot(i + 36);
            }
        }
    }

    /** Updates the station inventory slots */
    updateStationInventory(data: SerializedChangesInventory): void {
        data.forEach(iu => {
            iu.slot += 36;
            this.playerclient.inventory.setSingleInventorySlot(iu);
        });
    }

    // #endregion
}

export default Inventory;
