import Item from "client/inventory/item.js";
import Recipe from "client/inventory/recipe.js";
import PlayerClient from "client/playerClient.js";
import SharedConfig from "configs/shared.js";
import { SwapContent } from "shared/messageContentTypes.js";
import { SerializedChangesSlot, SerializedUpdateInventory, SerializedChangesInventory } from "shared/serialization/items/serializedInventory.js";
import { SerializedUpdateItemStack } from "shared/serialization/items/serializedItemStack.js";
import { SerializedRecipe } from "shared/serialization/items/serializedRecipe.js";

const { INVENTORY_SIZE } = SharedConfig.INVENTORY;

/** The representation of inventory data of the client */
class Inventory {
    private readonly playerclient: PlayerClient;
    private readonly inventory: (Item | null)[] = new Array(INVENTORY_SIZE + 27).fill(null);
    private readonly recipes: Recipe[] = [];

    private station: string | null = null;
    private stationclosing: boolean = false;

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

        if(slot < 9){
            const asset = this.playerclient.renderer.assetManager.getAssetRender(item.asset, "", 64)!;
            this.playerclient.renderer.uiManager.hotbarui.getSlot(slot)
                .updateItem(item, asset);
        }
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

        if(slot < 9)
            this.playerclient.renderer.uiManager.hotbarui.getSlot(slot)
                .updateItem(null);
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

    /** Returns the current station being used by the player */
    getStation(): string | null {
        return this.station;
    }

    /** Sets the current station being used by the player */
    setStation(station: string | null): void {
        this.station = station;

        if(station === null){
            this.clearStationInventory();
            this.stationclosing = true;
        }

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

    /** Returns if a station is currently open */
    isStationClosing(): boolean {
        if(this.stationclosing){
            this.stationclosing = false;
            return true;
        }else{
            return false;
        }
    }

    // #endregion
}

export default Inventory;
