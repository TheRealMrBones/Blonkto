import Game from "../game.js";
import Inventory from "../items/inventory.js";
import Recipe from "../items/recipe.js";

const defaultrecipesfolder = "recipes";

/** Manages crafting opeprations on all loaded recipes */
class CraftManager {
    game: Game;
    recipes: Recipe[];

    constructor(game: Game){
        this.game = game;
        this.recipes = [];

        this.loadRecipes();
    }

    /** Loads all JSON recipes written in the default location */
    loadRecipes(folder?: string): void {
        const folder2 = folder || defaultrecipesfolder;

        const recipeFiles: any[] = [];//this.game.fileManager.getFiles(folder2);
        for(const file of recipeFiles) {
            this.loadSingleRecipe(file);
        }
    }

    /** Loads a single recipe from the given file */
    loadSingleRecipe(file: string): void {
        const recipeData = this.game.fileManager.readFile(file);
        if(recipeData === null) return;
        const recipe = JSON.parse(recipeData);
        this.loadRecipe(recipe);
    }

    /** Loads a recipe from its parsed data */
    loadRecipe(recipe: any): void {
        this.addRecipe(new Recipe(recipe.result, recipe.ingredients, recipe.resultCount));
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

    /** Returns all recipes craftable with the given inventories items */
    getCraftableRecipes(inventory: Inventory): Recipe[] {
        const recipes: Recipe[] = [];
        for(const recipe of this.recipes) {
            let cancraft = true;
            for(const ingredient in recipe.ingredients) {
                if(inventory.contains(ingredient, recipe.ingredients[ingredient])) {
                    cancraft = false;
                    break;
                }
            }
            if(cancraft) recipes.push(recipe);
        }
        return recipes;
    }
}

export default CraftManager;