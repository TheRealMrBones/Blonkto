import Game from "../game.js";
import Recipe from "../items/recipe.js";

/** Manages crafting opeprations on all loaded recipes */
class CraftManager {
    game: Game;
    recipes: Recipe[];

    constructor(game: Game){
        this.game = game;
        this.recipes = [];
    }

    /** Loads all recipes written in the default location */
    loadRecipes(): void {
        const recipeFiles: any[] = [];//this.game.fileManager.getFiles("recipes");
        for(const file of recipeFiles) {
            const recipeData = this.game.fileManager.readFile(file);
            if(recipeData === null) continue;
            const recipe = JSON.parse(recipeData);
            this.addRecipe(new Recipe(recipe.result, recipe.ingredients, recipe.resultCount));
        }
    }

    /** Adds a recipe to the list of available recipes */
    addRecipe(recipe: Recipe): void {
        this.recipes.push(recipe);
    }

    /** Returns the recipes for the given search */
    getRecipes(search: string): Recipe[] {
        const recipes: Recipe[] = [];
        for(const recipe of this.recipes) {
            if(recipe.result.includes(search)) recipes.push(recipe);
        }
        return recipes;
    }
}

export default CraftManager;