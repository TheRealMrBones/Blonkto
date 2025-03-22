import Game from "../game.js";
import Player from "../objects/player.js";
import ItemRegistry from "../registries/itemRegistry.js";
import Item from "./item.js";

/** An in game instance of an item/stack of multiple of the same item */
class ItemStack {
    item: Item;
    private amount: number = 1;

    constructor(item: string, amount?: number){
        this.item = ItemRegistry.get(item);
        if(amount !== undefined) this.setAmount(amount);
    }

    /** sends the use event to all listeners for this stacks item type */
    use(game: Game, player: Player, info: any): void {
        this.item.eventEmitter.emit("use", game, player, this, info);
    }

    // #region setters

    /** Sets the amount of the item this stack contains */
    setAmount(amount: number): void {
        this.amount = Math.min(Math.max(amount, 0), this.item.stacksize);
    }

    /** Adds to the amount of the item this stack contains */
    addAmount(amount: number): boolean {
        const oldamount = this.amount;
        this.setAmount(this.amount + amount);
        return (this.amount == oldamount + amount);
    }

    /** Removes from the amount of the item this stack contains */
    removeAmount(amount: number): boolean {
        this.setAmount(this.amount - amount);
        return (this.amount == 0);
    }

    /** Merges this stack with another stack if it is of the same item */
    mergeStack(otherstack: ItemStack): boolean {
        if(otherstack.item.name != this.item.name || this.amount == 0) return false;

        const oldamount = this.amount;
        this.addAmount(otherstack.amount);
        const diff = this.amount - oldamount;

        return otherstack.removeAmount(diff);
    }

    // #endregion

    // #region getters

    /** Get the amount of the item this stack contains */
    getAmount(): number{
        return this.amount;
    }

    // #endregion

    // #region serialization

    /** Return an object representing this items data for a game update to the client */
    serializeForUpdate(): any {
        return {
            displayname: this.item.displayname,
            name: this.item.name,
            asset: this.item.asset,
            amount: this.amount,
        };
    }

    /** Return an object representing this items data for writing to the save */
    serializeForWrite(): any {
        return {
            name: this.item.name,
            amount: this.amount,
        };
    }

    // #endregion
}

export default ItemStack;