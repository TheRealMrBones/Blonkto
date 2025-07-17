/** Representation of a single item stack in data */
class Item {
    name: string;
    asset: string;
    amount: number;

    constructor(name: string, asset: string, amount: number){
        this.name = name;
        this.asset = asset;
        this.amount = amount;
    }
}

export default Item;
