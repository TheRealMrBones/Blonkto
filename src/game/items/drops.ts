import Game from "../game";
import DroppedStack from "../objects/droppedStack";
import ItemRegistry from "../registries/itemRegistry";
import Item from "./item";
import ItemStack from "./itemStack";

/** Defines and Handles item drops for a game element */
class Drops {
    item: Item;
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
        this.maxamount = maxamount || Number.MAX_SAFE_INTEGER;
    }

    /** Calculates and drops the specified amounts of items */
    drop(x: number, y: number, game: Game): void {
        if(Math.random() > this.chance) return;
        let dropamount = this.amount;

        const additionalchance = Math.random();
        if(this.chanceperadditional > 0 && additionalchance != 0){
            dropamount += Math.log(additionalchance) / Math.log(this.chanceperadditional);
        }

        for(let i = 1; i <= dropamount / this.item.stacksize; i++){
            this.dropStack(x, y, this.item.stacksize, game);
        }
        if(dropamount % this.item.stacksize > 0) this.dropStack(x, y, dropamount % this.item.stacksize, game);
    }

    //** Drops a single stack */
    private dropStack(x: number, y: number, amount: number, game: Game): void {
        const droppedstack = DroppedStack.getDroppedWithSpread(x, y, new ItemStack(this.item.name, amount), this.spread);
        game.objects[droppedstack.id] = droppedstack;
    }
}

export default Drops;