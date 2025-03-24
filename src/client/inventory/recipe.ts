import { CraftContent } from "../../shared/messagecontenttypes.js";
import { craft } from "../networking/networking.js";
import { getInventory } from "./inventory.js";
import { Item } from "./item.js";

const craftingmenudiv = document.getElementById("craftingmenu")!;

export class Recipe {
    ingredients: any[];
    result: string;
    resultcount: number;
    asset: string;
    div: HTMLDivElement;

    constructor(result: string, ingredients: any[], resultcount: number, asset: string) {
        this.result = result;
        this.ingredients = ingredients;
        this.resultcount = resultcount;
        this.asset = asset;

        this.div = document.createElement("div");
        this.div.className = "craftingslot";
        
        const itemimg = document.createElement("img");
        itemimg.className = "item";
        itemimg.src = asset;
        this.div.appendChild(itemimg);

        if(resultcount > 1){
            const itemamount = document.createElement("p");
            itemamount.className = "itemamount";
            itemamount.innerHTML = resultcount.toString();
            this.div.appendChild(itemamount);
        }

        craftingmenudiv.appendChild(this.div);

        this.div.onclick = (e) => {
            if(this.canCraft(getInventory())){
                const amount = e.ctrlKey ? this.canCraftAmount(getInventory()) : 1;
                
                const ingredientsdictionary: { [key: string]: number } = {};
                this.ingredients.forEach((ingredient: any) => {
                    ingredientsdictionary[ingredient.item] = ingredient.amount;
                });

                const content: CraftContent = {
                    ingredients: ingredientsdictionary,
                    amount: amount,
                };
                craft(content);
            }
        };
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