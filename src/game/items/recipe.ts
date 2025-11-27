import Game from "game/game.js";
import IInventory from "game/items/inventory/IInventory.js";
import DroppedStack from "game/objects/droppedStack.js";
import ItemRegistry from "game/registries/itemRegistry.js";
import Layer from "game/world/layer.js";
import { SerializedRecipe } from "shared/serialization/items/serializedRecipe.js";

class Recipe {
    readonly ingredients: { [item: string]: number };
    readonly result: string;
    readonly resultcount: number;
    readonly station: string | null;

    constructor(result: string, ingredients: { [item: string]: number }, resultCount?: number, station?: string) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultcount = resultCount || 1;
        this.station = station || null;
    }

    /** Returns a recipe object loaded from the data of a json file */
    static readFromJson(data: string): Recipe {
        const recipe = JSON.parse(data);
        return new Recipe(recipe.result, recipe.ingredients, recipe.resultCount, recipe.station);
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
    canCraft(inventory: IInventory, station: string | null): boolean {
        if(this.station !== null && this.station != station) return false;
        for(const ingredient in this.ingredients) {
            if(!inventory.contains(ingredient, this.ingredients[ingredient])) return false;
        }
        return true;
    }

    /** Returns the amount of the given recipe the given inventory can craft */
    canCraftAmount(inventory: IInventory, station: string | null): number {
        if(this.station !== null && this.station != station) return 0;

        let amount = Infinity;
        for(const ingredient in this.ingredients){
            amount = Math.min(amount, Math.floor(inventory.containsAmount(ingredient) / this.ingredients[ingredient]));
        }

        return amount;
    }

    /** Crafts the requested recipe and either adds it to the inventory or drops it at the given position */
    craftRecipe(game: Game, station: string | null, inventory: IInventory, layer: Layer, x: number, y:number, amount?: number): void {
        const craftamount = Math.min(amount || 1, this.canCraftAmount(inventory, station)) * this.resultcount;
        if(craftamount == 0) return;

        for(const ingredient in this.ingredients){
            const removeamount = this.ingredients[ingredient] * craftamount / this.resultcount;
            inventory.removeItem(ingredient, removeamount);
        }

        const leftover = inventory.collectItem(this.result, craftamount);
        if(leftover > 0) DroppedStack.dropManyWithSpread(game, layer, x, y, this.result, leftover, .3);
    }

    // #region serialization

    /** Returns an object representing this recipes data for a game update to the client */
    serializeForUpdate(): SerializedRecipe {
        return {
            ingredients: Object.entries(this.ingredients).map(([item, amount]) => ({
                item: item,
                amount: amount,
                asset: ItemRegistry.get(item).getAsset(),
            })),
            result: this.result,
            resultcount: this.resultcount,
            station: this.station,
            asset: ItemRegistry.get(this.result).getAsset(),
        };
    }

    // #endregion
}

export default Recipe;
