import { Item } from "./item.js";

export class Recipe {
    ingredients: { [item: string]: number };
    result: string;
    resultcount: number;
    asset: string;

    constructor(result: string, ingredients: { [item: string]: number }, resultCount: number, asset: string) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultcount = resultCount;
        this.asset = asset;
    }

    /** Returns if the requested inventory can craft this item */
    canCraft(inventory: (Item | null)[]): boolean {
        for(const ingredient in this.ingredients) {
            let ingredientamount = 0;
            for(const item of inventory){
                if(item !== null && item.name === ingredient) ingredientamount += item.amount;
            }

            if(ingredientamount < this.ingredients[ingredient]) return false;
        }
        return true;
    }

    /** Returns the amount of the given recipe the given inventory can craft */
    canCraftAmount(inventory: (Item | null)[]): number {
        let amount = Number.MAX_SAFE_INTEGER;
        for(const ingredient in this.ingredients){
            let ingredientamount = 0;
            for(const item of inventory){
                if(item !== null && item.name === ingredient) ingredientamount += item.amount;
            }

            amount = Math.min(amount, Math.floor(ingredientamount / this.ingredients[ingredient]));
        }

        return amount;
    }
}