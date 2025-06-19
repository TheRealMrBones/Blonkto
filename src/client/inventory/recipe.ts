import PlayerClient from "../playerClient.js";
import { CraftContent } from "../../shared/messageContentTypes.js";
import Item from "./item.js";

const craftingmenudiv = document.getElementById("craftingmenu")!;

/** The representation of a crafting recipe that has been learned on this client */
class Recipe {
    ingredients: any[];
    result: string;
    resultcount: number;
    asset: string;
    div: HTMLDivElement;

    constructor(result: string, ingredients: any[], resultcount: number, asset: string, playerclient: PlayerClient) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultcount = resultcount;
        this.asset = asset;

        this.div = document.createElement("div");

        const maindiv = document.createElement("div");
        maindiv.className = "craftingslot";
        
        const itemimg = document.createElement("img");
        itemimg.className = "item";
        itemimg.src = asset;
        maindiv.appendChild(itemimg);

        if(resultcount > 1){
            const itemamount = document.createElement("p");
            itemamount.className = "itemamount";
            itemamount.innerHTML = resultcount.toString();
            maindiv.appendChild(itemamount);
        }

        this.div.appendChild(maindiv);

        for(const ingredient of ingredients){
            const ingredientdiv = document.createElement("div");
            ingredientdiv.className = "ingredientslot";

            const ingredientimg = document.createElement("img");
            ingredientimg.className = "item";
            ingredientimg.src = ingredient.asset;
            ingredientdiv.appendChild(ingredientimg);

            if(ingredient.amount > 1){
                const ingredientamount = document.createElement("p");
                ingredientamount.className = "itemamount";
                ingredientamount.innerHTML = ingredient.amount.toString();
                ingredientdiv.appendChild(ingredientamount);
            }

            this.div.appendChild(ingredientdiv);
        }

        maindiv.onclick = (e) => {
            if(this.canCraft(playerclient.inventory.getInventory())){
                const amount = e.ctrlKey ? this.canCraftAmount(playerclient.inventory.getInventory()) : 1;
                
                const ingredientsdictionary: { [key: string]: number } = {};
                this.ingredients.forEach((ingredient: any) => {
                    ingredientsdictionary[ingredient.item] = ingredient.amount;
                });

                const content: CraftContent = {
                    ingredients: ingredientsdictionary,
                    amount: amount,
                };
                playerclient.networkingManager.craft(content);
            }
        };

        craftingmenudiv.appendChild(this.div);
        craftingmenudiv.appendChild(document.createElement("br"));
    }

    /** Returns if the requested inventory can craft this item */
    canCraft(inventory: (Item | null)[]): boolean {
        for(const ingredient of this.ingredients) {
            let ingredientamount = 0;
            for(const item of inventory){
                if(item !== null && item.name === ingredient.item) ingredientamount += item.amount;
            }

            if(ingredientamount < ingredient.amount) return false;
        }
        return true;
    }

    /** Returns the amount of the given recipe the given inventory can craft */
    canCraftAmount(inventory: (Item | null)[]): number {
        let amount = Infinity;
        for(const ingredient of this.ingredients){
            let ingredientamount = 0;
            for(const item of inventory){
                if(item !== null && item.name === ingredient.item) ingredientamount += item.amount;
            }

            amount = Math.min(amount, Math.floor(ingredientamount / ingredient.amount));
        }

        return amount;
    }

    /** Toggle visibility of this crafting recipe based on it if is craftable */
    toggleVisibility(inventory: (Item | null)[]): void {
        if(this.canCraft(inventory)){
            this.div.style.display = "block";
        }else{
            this.div.style.display = "none";
        }
    }
}

export default Recipe;