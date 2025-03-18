import DroppedStack from "../objects/droppedStack.js";
import Player from "../objects/player.js";
import ItemRegistry from "../registries/itemRegistry.js";
import Inventory from "./inventory.js";
import ItemStack from "./itemStack.js";

class Recipe {
    ingredients: { [item: string]: number };
    result: string;
    resultCount: number;

    constructor(result: string, ingredients: { [item: string]: number }, resultCount?: number) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultCount = resultCount || 1;
    }

    /** Returns if the requested player can craft this item */
    canCraft(player: Player): boolean {
        for(const ingredient in this.ingredients) {
            if(!player.inventory.contains(ingredient, this.ingredients[ingredient])) {
                return false;
            }
        }
        return true;
    }

    /** Returns the amount of the given recipe the given inventory can craft */
    canCraftAmount(inventory: Inventory): number {
        let amount = Number.MAX_SAFE_INTEGER;
        for(const ingredient in this.ingredients){
            amount = Math.min(amount, Math.floor(inventory.containsAmount(ingredient) / this.ingredients[ingredient]));
        }

        return amount;
    }

    /** Crafts the requested recipe and either adds it to the inventory or drops it at the given position */
    craftRecipe(inventory: Inventory, x: number, y:number, amount?: number): void {
        let craftamount = Math.min(amount || 1, this.canCraftAmount(inventory)) * this.resultCount;
        const stacksize = ItemRegistry.get(this.result).stacksize;

        for(const ingredient in this.ingredients){
            const removeamount = this.ingredients[ingredient] * craftamount;
            inventory.removeItem(ingredient, removeamount);
        }

        while(craftamount > 0){
            const stackamount = Math.min(craftamount, stacksize);
            craftamount -= stackamount;

            const itemstack = new ItemStack(this.result, stackamount);
            DroppedStack.getDroppedWithSpread(x, y, itemstack, .1);
        }
    }
}

export default Recipe;