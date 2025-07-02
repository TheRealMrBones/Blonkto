import { CraftContent } from "../../shared/messageContentTypes.js";
import { Pos } from "../../shared/types.js";
import Game from "../game.js";
import Inventory from "../items/inventory.js";
import Recipe from "../items/recipe.js";

const defaultrecipesfolder = "recipes";

/** Manages crafting opeprations on all loaded recipes */
class CraftManager {
    private game: Game;
    private recipes: Recipe[];
    private playerrecipes: { [playerid: string]: Recipe[] };

    constructor(game: Game){
        this.game = game;
        this.recipes = [];
        this.playerrecipes = {};

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
    getCraftableRecipes(inventory: Inventory, station: string | null, playerid?: string): Recipe[] {
        const recipes: Recipe[] = [];
        for(const recipe of this.recipes) {
            if(playerid !== undefined){
                if(this.playerrecipes[playerid].includes(recipe)) continue;
            }
            if(recipe.canCraft(inventory, station)) recipes.push(recipe);
        }

        if(playerid !== undefined){
            for(const recipe of recipes) {
                this.playerrecipes[playerid].push(recipe);
            }
        }

        return recipes;
    }

    // #endregion

    // #region player recipes

    /** Returns if this player is yet to get initial recipes */
    playerHasInitialRecipes(playerid: string): boolean {
        if(this.playerrecipes[playerid] !== undefined) return false;
        this.playerrecipes[playerid] = [];
        return true;
    }

    // #endregion

    // #region crafting

    /** Tries to craft whatever recipe takes the given ingredients */
    craftRecipe(inventory: Inventory, x: number, y: number, content: CraftContent): void {
        const recipe = this.getRecipeFromIngredients(content.result, content.ingredients);
        if(recipe === null) return;
        recipe.craftRecipe(this.game, inventory, x, y, content.amount);
    }

    // #endregion

    // #region serialization

    /** Return the list of recipe data for all craftable recipes for a game update to the client */
    serializeCraftableRecipesForUpdate(inventory: Inventory, station: Pos | null, playerid?: string): any[] {
        let stationname = null;
        if(station !== null){
            const cell = this.game.world.getCell(station.x, station.y, false);
            if(cell !== null){
                if(cell.block !== null){
                    stationname = cell.block.definition.getRegistryKey();
                }
            }
        }

        return this.getCraftableRecipes(inventory, stationname, playerid).map(recipe => recipe.serializeForUpdate());
    }

    // #endregion
}

export default CraftManager;