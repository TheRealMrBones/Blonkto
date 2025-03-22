import Game from "../game.js";
import DroppedStack from "../objects/droppedStack.js";
import ItemRegistry from "../registries/itemRegistry.js";
import Inventory from "./inventory.js";
import ItemStack from "./itemStack.js";

class Recipe {
    ingredients: { [item: string]: number };
    result: string;
    resultcount: number;

    constructor(result: string, ingredients: { [item: string]: number }, resultCount?: number) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultcount = resultCount || 1;
    }

    /** Returns a recipe object loaded from the data of a json file */
    static readFromJson(data: string): Recipe {
        const recipe = JSON.parse(data);
        return new Recipe(recipe.result, recipe.ingredients, recipe.resultCount);
    }

    /** Returns if this ingredients list correctly matches this recipes */
    matchesIngredients(ingredients: { [item: string]: number }): boolean {
        if(ingredients.length !== this.ingredients.length) return false;
        for(const ingredient in this.ingredients) {
            if(ingredients[ingredient] !== this.ingredients[ingredient]) return false;
        }
        return true;
    }

    /** Returns if the requested inventory can craft this item */
    canCraft(inventory: Inventory): boolean {
        for(const ingredient in this.ingredients) {
            if(!inventory.contains(ingredient, this.ingredients[ingredient])) return false;
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
    craftRecipe(game: Game, inventory: Inventory, x: number, y:number, amount?: number): void {
        let craftamount = Math.min(amount || 1, this.canCraftAmount(inventory)) * this.resultcount;
        const stacksize = ItemRegistry.get(this.result).stacksize;

        for(const ingredient in this.ingredients){
            const removeamount = this.ingredients[ingredient] * craftamount;
            inventory.removeItem(ingredient, removeamount);
        }

        const leftover = inventory.collectItem(this.result, craftamount);
        if(leftover > 0) DroppedStack.dropManyWithSpread(game, x, y, this.result, leftover, .3);
    }

    // #region serialization

    /** Return an object representing this recipes data for a game update to the client */
    serializeForUpdate(): any {
        return {
            ingredients: this.ingredients,
            result: this.result,
            resultcount: this.resultcount,
            asset: ItemRegistry.get(this.result).asset,
        };
    }

    // #endregion
}

export default Recipe;