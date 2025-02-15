import Item from "./item";

class ItemStack {
    item: Item;
    private amount: number = 1;

    constructor(item: Item, amount?: number){
        this.item = item;
        if(amount !== undefined) this.setAmount(amount);
    }

    // #region setters

    setAmount(amount: number){
        this.amount = Math.min(Math.max(amount, 0), this.item.stacksize);
    }

    addAmount(amount: number){
        const oldamount = this.amount;
        this.setAmount(this.amount + amount);
        return (this.amount == oldamount + amount);
    }

    removeAmount(amount: number){
        this.setAmount(this.amount - amount);
        return (this.amount == 0);
    }

    mergeStack(otherstack: ItemStack){
        if(otherstack.item.name != this.item.name || this.amount == 0){
            return false;
        }

        const oldamount = this.amount;
        this.addAmount(otherstack.amount);
        const diff = this.amount - oldamount;

        return otherstack.removeAmount(diff);
    }

    // #endregion

    // #region getters

    getAmount(): number{
        return this.amount;
    }

    // #endregion

    // #region serialization

    serializeForUpdate(){
        return {
            displayname: this.item.displayname,
            asset: this.item.asset,
            amount: this.amount,
        };
    }

    serializeForWrite(){
        return {
            name: this.item.name,
            amount: this.amount,
        };
    }

    // #endregion
}

export default ItemStack;