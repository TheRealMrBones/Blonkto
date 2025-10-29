import { CraftContent } from "../../shared/messageContentTypes.js";
import { SerializedRecipe } from "../../shared/serialization/items/serializedRecipe.js";
import Game from "../game.js";
import IInventory from "../items/inventory/IInventory.js";
import Recipe from "../items/recipe.js";
import Player from "../objects/player.js";
import Layer from "../world/layer.js";

const defaultrecipesfolder = "recipes";

/** Manages crafting opeprations on all loaded recipes */
class CraftManager {
    private readonly game: Game;
    private readonly recipes: Recipe[] = [];

    constructor(game: Game){
        this.game = game;

        this.loadRecipes();
    }

    // #regpion loading

    /** Loads all JSON recipes written in the default location */
    loadRecipes(folder?: string): void {
        const folder2 = folder || defaultrecipesfolder;

        const recipeFiles: any[] = this.game.fileManager.listDirectory(folder2, "definitions");
        for(const file of recipeFiles) {
            this.loadSingleRecipe(file);
        }
    }

    /** Loads a single recipe from the given file */
    loadSingleRecipe(file: string, folder?: string): void {
        const folder2 = folder || defaultrecipesfolder;

        const data = this.game.fileManager.readFile(`${folder2}/${file}`, "definitions");
        if(data === null) return;
        this.loadRecipe(data);
    }

    /** Loads a recipe from its parsed data */
    loadRecipe(data: string): void {
        this.addRecipe(Recipe.readFromJson(data));
    }

    /** Adds a recipe to the list of available recipes */
    addRecipe(recipe: Recipe): void {
        this.recipes.push(recipe);
    }

    // #endregion

    // #region getters

    /** Returns the recipes for the given search */
    getRecipes(search: string): Recipe[] {
        const recipes: Recipe[] = [];
        for(const recipe of this.recipes) {
            if(recipe.result.includes(search)) recipes.push(recipe);
        }
        return recipes;
    }

    /** Returns the recipe that matches the given ingredients if one exists */
    getRecipeFromIngredients(result: string, ingredients: { [item: string]: number }): Recipe | null {
        for(const recipe of this.recipes) {
            if(recipe.matchesIngredients(ingredients) && result == recipe.result) return recipe;
        }
        return null;
    }

    /** Returns all recipes craftable with the given inventories items */
    getCraftableRecipes(inventory: IInventory, station: string | null): Recipe[] {
        const recipes: Recipe[] = [];
        for(const recipe of this.recipes) {
            if(recipe.canCraft(inventory, station)) recipes.push(recipe);
        }

        return recipes;
    }

    // #endregion

    // #region crafting

    /** Tries to craft whatever recipe takes the given ingredients */
    craftRecipe(inventory: IInventory, station: string | null, layer: Layer, x: number, y: number, content: CraftContent): void {
        const recipe = this.getRecipeFromIngredients(content.result, content.ingredients);
        if(recipe === null) return;
        recipe.craftRecipe(this.game, station, inventory, layer, x, y, content.amount);
    }

    // #endregion

    // #region serialization

    /** Returns the list of recipe data for all craftable recipes for a game update to the client */
    serializeCraftableRecipesForUpdate(player: Player): SerializedRecipe[] {
        if(!this.playerNeedsRecipeUpdate(player)) return [];

        const station = player.getStation();
        const stationname = station !== null ? station.name : null;

        const allrecipes = this.getCraftableRecipes(player.getCombinedInventory(), stationname);
        for(let i = 0; i < allrecipes.length; i++){
            const recipe = allrecipes[i];
            if(!player.addRecipe(recipe)){
                allrecipes.splice(i, 1);
                i--;
            }
        }

        return allrecipes.map(recipe => recipe.serializeForUpdate());
    }

    /** Returns if this player needs a recipe update */
    playerNeedsRecipeUpdate(player: Player): boolean {
        let recipesneeded = false;

        const station = player.getStation();

        if(player.getInventory().anyChanges()) recipesneeded = true;
        if(station !== null) if(station.playerNeedsRecipeUpdate(player)) recipesneeded = true;

        return recipesneeded;
    }

    // #endregion
}

export default CraftManager;
