import Player from "../objects/player.js";

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
}

export default Recipe;