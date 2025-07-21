import Game from "../../game.js";
import DroppedStack from "../../objects/droppedStack.js";
import ItemRegistry from "../../registries/itemRegistry.js";
import IDrop from "./IDrop.js";
import ItemDefinition from "../../definitions/itemDefinition.js";
import ItemStack from "../itemStack.js";
import Layer from "../../world/layer.js";

/** The base drop class for creating dropped items */
class Drop implements IDrop {
    item: ItemDefinition;
    amount: number;
    spread: number = .3;
    chance: number;
    chanceperadditional: number;
    maxamount: number;

    constructor(item: string, amount?: number, chance?: number, chanceperadditional?: number, maxamount?: number){
        this.item = ItemRegistry.get(item);
        this.amount = amount || 1;
        this.chance = chance || 1;
        this.chanceperadditional = chanceperadditional || 0;
        this.maxamount = maxamount || Infinity;
    }

    /** Calculates and drops the specified amounts of items */
    drop(layer: Layer, x: number, y: number, game: Game): void {
        if(Math.random() > this.chance) return;
        let dropamount = this.amount;

        const additionalchance = Math.random();
        if(this.chanceperadditional > 0 && additionalchance != 0){
            dropamount += Math.floor(Math.log(additionalchance) / Math.log(this.chanceperadditional));
        }
        dropamount = Math.min(dropamount, this.maxamount);

        for(let i = 1; i <= dropamount / this.item.getStackSize(); i++){
            this.dropStack(layer, x, y, this.item.getStackSize(), game);
        }
        if(dropamount % this.item.getStackSize() > 0) this.dropStack(layer, x, y, dropamount % this.item.getStackSize(), game);
    }

    //** Drops a single stack */
    private dropStack(layer: Layer, x: number, y: number, amount: number, game: Game): void {
        DroppedStack.dropWithSpread(game, layer, x, y, new ItemStack(this.item.key, amount), this.spread);
    }
}

export default Drop;
